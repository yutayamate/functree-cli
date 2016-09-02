#!/usr/bin/env python3
# -*- coding: utf-8 -*-


"""

    abundance.py: Caluculate gene abundances for KEGG / EnteroPathway
    http://www.bioviz.tokyo/functree2/


"""

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
        prog='abundance.py',
        description='abundance.py: Caluculate gene abundances for KEGG / EnteroPathway'
    )

    parser.add_argument(
        '-v',
        '--version',
        action='version',
        version='%(prog)s 1.0.0'
    )

    parser.add_argument(
        '-i',
        '--input',
        nargs='?',
        type=argparse.FileType('r'),
        default=sys.stdin,
        help='specify input table file'
    )

    parser.add_argument(
        '-o',
        '--output',
        nargs='?',
        type=argparse.FileType('w'),
        default=sys.stdout,
        help='specify output table file'
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
        choices=['sum', 'average'],
        help='specify abundance caluculation method'
    )

    args = parser.parse_args()


    # Load reference database JSON file
    f = open(os.path.dirname(__file__) + '/../data/ref/' + args.database + '.json', 'r')
    root = json.load(f)
    nodes = get_nodes(root)


    # Caluculate abundance
    df = pd.read_csv(args.input, delimiter='\t', index_col='#ID')

    for i in nodes:
        if 'children' not in i:
            continue

        targets = [ x['name'] for x in get_nodes(i) if 'children' not in x ]
        ix = df.ix[targets]

        if args.method == 'sum':
            d = ix.sum()
        elif args.method == 'average':
            d = ix.mean()

        df.ix[i['name']] = d


    # Output results to TSV file
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
