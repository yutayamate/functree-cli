#!/usr/bin/env python3
# -*- coding: utf-8 -*-


import sys
import os
import argparse
import urllib.request
import re
import json
import numpy as np
import pandas as pd


def main():
    # Setup command-line arguments
    parser = argparse.ArgumentParser(
        prog='stats.py',
        description='stats.py: Yet another statistical analysis tool'
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
        nargs='?',
        type=argparse.FileType('r'),
        default=sys.stdin,
        help='specify input file'
    )

    parser.add_argument(
        '-o',
        '--output',
        nargs='?',
        type=argparse.FileType('w'),
        default=sys.stdout,
        help='specify output file'
    )

    parser.add_argument(
        '-d',
        '--database',
        required=True,
        choices=['kegg', 'enteropathway'],
        help='specify reference database'
    )

    parser.add_argument(
        '-m',
        '--method',
        required=True,
        choices=['sum', 'average', 'variance'],
        help='specify analysis method'
    )

    args = parser.parse_args()


    # Load reference database JSON file
    fpath = os.path.join(os.path.dirname(__file__), '../data/ref/', (args.database + '.json'))
    f = open(fpath, 'r')
    root = json.load(f)
    nodes = get_nodes(root)


    # Caluculate abundance
    # df = pd.read_csv(args.input, delimiter='\t', index_col='#ID')
    df = pd.read_csv(args.input, delimiter='\t', comment='#', header=0, index_col=0)

    # Get comment rows
    args.input.seek(0)
    comment = ''.join(filter(lambda x: re.match('#', x), args.input.readlines()))

    for i in nodes:
        if 'children' not in i:
            continue

        targets = [ x['name'] for x in get_nodes(i) if 'children' not in x ]
        ix = df.ix[targets]

        if args.method == 'sum':
            d = ix.sum()
        elif args.method == 'average':
            d = ix.mean()
        elif args.method == 'variance':
            d = ix.var()

        df.ix[i['name']] = d


    # Output results to TSV file
    args.output.write(comment)
    args.output.write('#' + ' '.join(sys.argv) + '\n')
    df.fillna(0.0).sort_index().to_csv(args.output, sep='\t')
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
