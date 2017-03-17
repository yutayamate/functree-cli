#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import re
import json
import time
import argparse
import pandas as pd
import numpy as np
import scipy.stats
import io


def main():
    parser = argparse.ArgumentParser(
        prog='stats.py',
        description='FuncTree statistical analysis tool'
    )
    parser.add_argument(
        '-v',
        '--version',
        action='version',
        version='%(prog)s 0.0.1'
    )
    parser.add_argument(
        '-i',
        '--input',
        type=argparse.FileType('r'),
        nargs='*',
        default=[sys.stdin],
        help='specify input file(s)'
    )
    parser.add_argument('-o',
        '--output',
        type=argparse.FileType('w'),
        nargs='?',
        default=sys.stdout,
        help='specify output file'
    )
    parser.add_argument(
        '-t',
        '--tree',
        type=argparse.FileType('r'),
        nargs='?',
        required=True,
        help='specify reference database'
    )
    parser.add_argument(
        '-c',
        '--config',
        type=argparse.FileType('r'),
        nargs='?',
        help='specify configuration file'
    )
    parser.add_argument(
        '-m',
        '--method',
        type=str,
        choices=['sum', 'mean', 'var', 'mannwhitneyu'],
        required=True,
        help='specify analysis method'
    )
    args = parser.parse_args()


    try:
        config = json.load(args.config)
    except:
        config_f = open(os.path.join(os.path.dirname(__file__), '../etc/config.json'), 'r')
        config = json.load(config_f)

    root = json.load(args.tree)
    nodes = get_nodes(root)


    if len(args.input) == 1 and args.method in ['sum', 'mean', 'var']:
        input_str = io.StringIO(args.input[0].read())
        input_df = pd.read_csv(
            input_str,
            delimiter='\t',
            comment='#',
            header=0,
            index_col=0
        )
        output_df = pd.DataFrame(columns=input_df.columns)

        # Get original header information
        input_str.seek(0)
        header_original = ''.join(filter(lambda x: re.match('#', x), input_str.readlines()))

        for i in nodes:
            if 'children' not in i:
                try:
                    d = input_df.ix[i['name']]
                except:
                    continue
            else:
                targets = [ x['name'] for x in get_nodes(i) if 'children' not in x ]
                ix = input_df.ix[targets]

                if args.method == 'sum':
                    d = ix.sum()
                elif args.method == 'mean':
                    d = ix.mean()
                elif args.method == 'var':
                    d = ix.var()

            output_df.ix[i['name']] = d


    elif len(args.input) == 2 and args.method in ['mannwhitneyu']:
        input_df_0 = pd.read_csv(
            args.input[0],
            delimiter='\t',
            comment='#',
            header=0,
            index_col=0
        )
        input_df_1 = pd.read_csv(
            args.input[1],
            delimiter='\t',
            comment='#',
            header=0,
            index_col=0
        )
        output_df = pd.DataFrame()

        for i in nodes:
            try:
                x = input_df_0.ix[i['name']]
                y = input_df_1.ix[i['name']]
                d = scipy.stats.mannwhitneyu(
                    x,
                    y,
                    use_continuity=config['mannwhitneyu']['use_continuity'],
                    alternative=config['mannwhitneyu']['alternative']
                )
                try:
                    if d.pvalue < 0.05:
                        score = np.log10(1 / d.pvalue)
                    else:
                        score = 0.0
                except:
                    score = 0.0
                output_df.ix[i['name'], 'log10(1_pvalue*)'] = score
                output_df.ix[i['name'], 'pvalue'] = d.pvalue
            except:
                # sys.stderr.write('Missing entry: \'' + i['name'] + '\'\n')
                continue

    else:
        sys.stderr.write('Error: Incongruous arguments and input(s)\n')
        sys.exit(1)


    try:
        args.output.write(header_original)
    except:
        pass


    header = '#date=' + time.ctime(time.time()) + '\n'
    #header = '#date=' + time.ctime(time.time()) + ';cmd=' + ' '.join(sys.argv) + '\n'
    args.output.write(header)
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
