#!/usr/bin/env python3

import sys, os, re, json, time, argparse, io, warnings
import numpy as np, scipy.stats, pandas as pd


def parse_arguments():
    parser = argparse.ArgumentParser(
        prog='stats.py',
        description='FuncTree-CLI statistical analysis tool'
    )
    parser.add_argument(
        '-v', '--version',
        action='version',
        version='%(prog)s 0.2.1'
    )
    parser.add_argument(
        '-i', '--input',
        type=argparse.FileType('r'),
        nargs='*',
        default=[sys.stdin],
        help='path to input abundance table(s)'
    )
    parser.add_argument(
        '-o', '--output',
        type=argparse.FileType('w'),
        nargs='?',
        default=sys.stdout,
        help='output result to file'
    )
    parser.add_argument(
        '-t', '--tree',
        type=argparse.FileType('r'),
        nargs='?',
        required=True,
        help='path to tree structure data JSON file'
    )
    parser.add_argument(
        '-m', '--method',
        type=str,
        choices=['sum', 'mean', 'var', 'mannwhitneyu'],
        required=True,
        help='specify statistical analysis method'
    )
    parser.add_argument(
        '-c', '--config',
        type=argparse.FileType('r'),
        nargs='?',
        help='path to configuration JSON file'
    )
    return parser.parse_args()


def load_config(config_f):
    if not config_f:
        config_path = os.path.join(
            os.path.dirname(__file__),
            '../etc/config.json'
        )
        config_f = open(config_path, 'r')
    return json.load(config_f)


def load_inputs(inputs):
    dfs = []
    headers = []
    for input_path in inputs:
        input_str = io.StringIO(input_path.read())
        df_in = pd.read_csv(
            input_str,
            delimiter='\t',
            comment='#',
            header=0,
            index_col=0
        )
        dfs.append(df_in)
        input_str.seek(0)
        header_lines = filter(lambda x: re.match('#', x), input_str.readlines())
        header = ''.join(header_lines)
        headers.append(header)
    return [dfs, headers]


def assign_abundances(df, nodes, method):
    df_out = pd.DataFrame(columns=df.columns)
    for i in nodes:
        if 'children' not in i:
            if i['name'] in df.index:
                d = df.ix[i['name']]
        else:
            targets = [x['name'] for x in get_nodes(i) if 'children' not in x]
            ix = df.ix[targets]

            if method == 'sum':
                d = ix.sum()
            elif method == 'mean':
                d = ix.mean()
            elif method == 'var':
                d = ix.var()
        df_out.ix[i['name']] = d
    return df_out


def do_statistical_test(dfs, nodes, method, config):
    df_out = pd.DataFrame()
    for i in nodes:
        if i['name'] in dfs[0].index and i['name'] in dfs[1].index:
            x = dfs[0].ix[i['name']]
            y = dfs[1].ix[i['name']]

            if method == 'mannwhitneyu':
                try:
                    d = scipy.stats.mannwhitneyu(
                        x,
                        y,
                        use_continuity=config[method]['use_continuity'],
                        alternative=config[method]['alternative']
                    )
                except ValueError:
                    continue
            if d.pvalue < 0.05:
                score = -np.log10(d.pvalue)
            else:
                score = 0.0
            df_out.ix[i['name'], '-log10(pvalue)*'] = score
            df_out.ix[i['name'], 'pvalue'] = d.pvalue
        else:
            warnings.warn('"{0}" is not found on input'.format(i['name']))
    return df_out


def get_nodes(d, nodes=None):
    if nodes is None:
        nodes = []
    nodes.append(d)
    if 'children' in d:
        for i in d['children']:
            get_nodes(i, nodes)
    return nodes


def main():
    args = parse_arguments()
    config = load_config(args.config)
    root = json.load(args.tree)
    nodes = get_nodes(root)
    dfs, headers = load_inputs(args.input)

    if len(args.input) == 1 and args.method in ['sum', 'mean', 'var']:
        df_out = assign_abundances(dfs[0], nodes, args.method)
    elif len(args.input) == 2 and args.method in ['mannwhitneyu']:
        df_out = do_statistical_test(dfs, nodes, args.method, config)
    else:
        raise ValueError('Incongruous arguments and input(s)')

    header = '#date={0}\n'.format(time.ctime(time.time())) + headers[0]
    args.output.write(header)
    df_out.fillna(0.0).sort_index().to_csv(args.output, sep='\t')


if __name__ == '__main__':
    main()
