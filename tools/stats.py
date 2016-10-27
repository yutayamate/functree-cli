#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import re
import json
import time
import argparse
import pandas as pd


def main():
    parser = argparse.ArgumentParser(prog='stats.py', description='FuncTree statistical analysis tool')
    parser.add_argument('-v', '--version', action='version', version='%(prog)s 0.0.1')
    parser.add_argument('-i', '--input', nargs='?', type=argparse.FileType('r'), default=sys.stdin, help='specify input file')
    parser.add_argument('-o', '--output', nargs='?', type=argparse.FileType('w'), default=sys.stdout, help='specify output file')
    parser.add_argument('-d', '--database',  type=str, required=True, help='specify reference database')
    parser.add_argument('-m', '--method', required=True, choices=['sum', 'average', 'variance'], help='specify analysis method')
    args = parser.parse_args()


    f = open(args.database, 'r')
    root = json.load(f)
    nodes = get_nodes(root)
    df = pd.read_csv(args.input, delimiter='\t', comment='#', header=0, index_col=0)

    # Get comments
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

    args.output.write(comment)
    args.output.write('#date=' + time.ctime(time.time()) + ';cmd=' + ' '.join(sys.argv) + '\n')
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
