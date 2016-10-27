#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import re
import json
import time
import argparse
import pandas as pd
import scipy.stats


def main():
    parser = argparse.ArgumentParser(prog='stats.py', description='FuncTree statistical analysis tool')
    parser.add_argument('-v', '--version', action='version', version='%(prog)s 0.0.1')
    parser.add_argument('-i', '--input', nargs='*', type=argparse.FileType('r'), default=[sys.stdin], help='specify input file(s)')
    parser.add_argument('-o', '--output', nargs='?', type=argparse.FileType('w'), default=sys.stdout, help='specify output file')
    parser.add_argument('-d', '--database', nargs='?', type=argparse.FileType('r'), required=True, help='specify reference database')
    parser.add_argument('-c', '--config', nargs='?', type=argparse.FileType('r'), help='specify configuration file')
    parser.add_argument('-m', '--method', required=True, choices=['sum', 'mean', 'var', 'mannwhitneyu'], help='specify analysis method')
    args = parser.parse_args()


    try:
        config = json.load(args.config)
    except:
        config_f = open(os.path.join(os.path.dirname(__file__), '../config/config.json'), 'r')
        config = json.load(config_f)

    root = json.load(args.database)
    nodes = get_nodes(root)


    if len(args.input) == 1 and args.method in ['sum', 'average', 'var']:
        input_df = pd.read_csv(args.input[0], delimiter='\t', comment='#', header=0, index_col=0)
        output_df = pd.DataFrame(columns=input_df.columns)

        # Get comments
        args.input[0].seek(0)
        comment = ''.join(filter(lambda x: re.match('#', x), args.input[0].readlines()))

        for i in nodes:
            if 'children' not in i:
                continue

            targets = [ x['name'] for x in get_nodes(i) if 'children' not in x ]
            ix = input_df.ix[targets]

            if args.method == 'sum':
                d = ix.sum()
            elif args.method == 'average':
                d = ix.mean()
            elif args.method == 'var':
                d = ix.var()

            output_df.ix[i['name']] = d


    elif len(args.input) == 2 and args.method in ['mannwhitneyu']:
        input_df_0 = pd.read_csv(args.input[0], delimiter='\t', comment='#', header=0, index_col=0)
        input_df_1 = pd.read_csv(args.input[1], delimiter='\t', comment='#', header=0, index_col=0)
        output_df = pd.DataFrame(columns=['pvalue'])

        for i in nodes:
            try:
                x = input_df_0.ix[i['name']]
                y = input_df_1.ix[i['name']]
                d = scipy.stats.mannwhitneyu(\
                    x, \
                    y, \
                    use_continuity=config['stats']['mannwhitneyu']['use_continuity'], \
                    alternative=config['stats']['mannwhitneyu']['alternative'] \
                )
                output_df.ix[i['name'], 'pvalue'] = d.pvalue
            except:
                # sys.stderr.write('Missing entry: \'' + i['name'] + '\'\n')
                continue

    else:
        sys.stderr.write('Error: Incongruous arguments and input(s)\n')
        sys.exit(1)


    try:
        args.output.write(comment)
    except:
        pass

    args.output.write('#date=' + time.ctime(time.time()) + ';cmd=' + ' '.join(sys.argv) + '\n')
    output_df.fillna(0.0).sort_index().to_csv(args.output, sep='\t')
    sys.exit(0)


def get_nodes(d, nodes=None):
    if nodes is None:
        nodes = []
    nodes.append(d)
    if 'children' in d:
        for i in d['children']:
            get_nodes(i, nodes)
    return nodes


if __name__ == '__main__':
    main()
