#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import argparse
import urllib.request
import re
import copy
import json
import time


def main():

    parser = argparse.ArgumentParser(prog='treegen', description='FuncTree JSON Generator')
    parser.add_argument('-v', '--version', action='version', version='%(prog)s 160403')
    # todo: generate EnteroPathway json file
    parser.add_argument('-d', '--database', metavar='database', choices=['kegg'], required=True, help='specify reference database')
    parser.add_argument('-o', '--output', metavar='file', type=argparse.FileType('w'), default=sys.stdout, help='write output to file')
    parser.add_argument('-i', '--indent', metavar='num', type=int, default=None, help='specify JSON indent level')
    args = parser.parse_args()

    template = {
        'id': None,
        'name': None,
        'label': None,
        'depth': None,
        'children': None
    }

    tree = copy.deepcopy(template)
    tree['name'] = 'Root'
    tree['label'] = 'FuncTree root'
    tree['depth'] = 0
    tree['children'] = []
    tree['version'] = time.strftime('%a, %d %b %Y', time.gmtime())
    parent = [ tree if x == 0 else None for x in range(0, 6) ]


    with urllib.request.urlopen('http://www.genome.jp/kegg-bin/download_htext?htext=br08901.keg&format=htext&filedir=') as f:

        for line in f.read().decode('utf-8').split('\n'):

            # ヘッダー・フッター行をスキップ
            if not re.match('A|B|C|D', line):
                continue

            # KEGG BRITE 1st category
            if re.match('A', line):
                line = line.lstrip('A').lstrip()
                name = label = re.compile(r'<[^>]*?>').sub('', line)
                depth = 1
                node = copy.deepcopy(template)
                node['name'] = name
                node['label'] = label
                node['depth'] = depth
                node['children'] = []
                parent[depth - 1]['children'].append(node)
                parent[depth] = node
                continue

            # KEGG BRITE 2nd category
            if re.match('B', line):
                line = line.lstrip('B').lstrip()
                name = label = line
                depth = 2
                node = copy.deepcopy(template)
                node['name'] = name
                node['label'] = label
                node['depth'] = depth
                node['children'] = []
                parent[depth - 1]['children'].append(node)
                parent[depth] = node
                continue

            # KEGG PATHWAY
            if re.match('C', line):
                line = line.lstrip('C').lstrip()
                number, label = line.split(maxsplit=1)
                name = 'path:map' + number
                depth = 3
                node = copy.deepcopy(template)
                node['name'] = name
                node['label'] = label
                node['depth'] = depth
                node['children'] = []
                parent[depth - 1]['children'].append(node)


    with urllib.request.urlopen('http://www.genome.jp/kegg-bin/download_htext?htext=ko00002.keg&format=htext&filedir=') as f:

        modules = []
        for line in f.read().decode('utf-8').split('\n'):

            # ヘッダー・フッター行をスキップ
            if not re.match('A|B|C|D|E', line):
                continue


            # KEGG MODULE
            if re.match('D', line):
                line = line.lstrip('D').lstrip()
                name, label = line.split(maxsplit=1)
                name = 'md:' + name
                depth = 4
                node = copy.deepcopy(template)
                node['name'] = name
                node['label'] = label
                node['depth'] = depth
                node['children'] = []
                modules.append(node)
                parent[depth] = node
                continue

            # KEGG Orthology (MODULEと対応するもの)
            if re.match('E' , line):
                line = line.lstrip('E').lstrip()
                # name, label = line.split(maxsplit=1)
                # 20160719追加 labelの記述が無いものへ対応 (暫定)
                try:
                    name, label = line.split(maxsplit=1)
                    name = 'ko:' + name
                except:
                    name = 'ko:' + line.rstrip()
                    label = 'N/A'
                # ここまで
                depth = 5
                node = copy.deepcopy(template)
                node['name'] = name
                node['label'] = label
                node['depth'] = depth
                node.pop('children')
                parent[depth - 1]['children'].append(node)

    # MODULEとPATHWAYをつなげる
    for node in modules:
        try:
            names = re.compile(r'\[.+?\]').search(node['label']).group()[1:-1].lstrip('PATH:').split()
            names = list(map(lambda x:'path:' + x, names))
        except:
            continue

        for name in [ x for x in names if re.match('path:map', x) ]:
                for target in [ x for x in getnodes(tree) if x['name'] == name ]:
                    target['children'].append(copy.deepcopy(node))

    # PATHWAYは定義されているが、MODULEが定義されていないKO
    with urllib.request.urlopen('http://www.genome.jp/kegg-bin/download_htext?htext=ko00001.keg&format=htext&filedir=') as f:

        for line in f.read().decode('utf-8').split('\n'):

            # ヘッダー・フッター行をスキップ
            if not re.match('A|B|C|D', line):
                continue


            # KEGG PATHWAY
            # ツリーからターゲットのPATHWAYを探す
            if re.match('C', line):
                line = line.lstrip('C').lstrip()
                name = 'path:map' + line.split(maxsplit=1)[0]
                targets = [ x for x in getnodes(tree) if x['name'] == name ]

                # ターゲットPATHWAYにUndefined MODULEを追加
                for target in targets:
                    node = copy.deepcopy(template)
                    node['name'] = 'Undefined MODULE'
                    node['label'] = 'Undefined MODULE'
                    node['depth'] = 4
                    node['children'] = []
                    target['children'].append(node)
                continue


            # KEGG Orthology
            # ターゲットPATHWAYになければUndefined MODULEに追加
            if re.match('D', line):
                line = line.lstrip('D').lstrip()
                name, label = line.split(maxsplit=1)
                name = 'ko:' + name
                depth = 5
                node = copy.deepcopy(template)
                node['name'] = name
                node['label'] = label
                node['depth'] = depth
                node.pop('children')

                for target in targets:
                    if name in [ x['name'] for x in getnodes(target) if x['depth'] == 5 ]:
                        continue
                    target['children'][-1]['children'].append(copy.deepcopy(node))


    # 不要なエントリーを削除
    tree['children'].pop(-1)                    # Drug Development
    tree['children'][0]['children'].pop(0)      # Global and overview maps
    tree['children'][0]['children'].pop(-1)     # Chemical structure transformation maps


    # KOがないMODULEを削除
    for pnode in [ x for x in getnodes(tree) if x['depth'] == 3 ]:
        for n, mnode in enumerate(pnode['children'][:]):
            if len(mnode['children']) == 0:
                pnode['children'].pop(n)


    # いずれにも属さないKO
    with urllib.request.urlopen('http://rest.genome.jp/list/ko') as f:

        parent = tree

        for i in range(1, 5):
            node = copy.deepcopy(template)
            name = {
                1: 'Undefined BRITE category',
                2: 'Undefined BRITE category',
                3: 'Undefined PATHWAY',
                4: 'Undefined MODULE'
            }[i]
            node['name'] = name
            node['label'] = name
            node['depth'] = i
            node['children'] = []
            parent['children'].append(node)
            parent = node


        kos = [ x for x in getnodes(tree) if x['depth'] == 5 ]

        for line in f.read().decode('utf-8').split('\n'):

            # 末尾の空白行をスキップ
            if line == '':
                continue

            name, label = line.split('\t')
            depth = 5
            node = copy.deepcopy(template)
            node['name'] = name
            node['label'] = label
            node['depth'] = depth
            node.pop('children')

            if not node in kos:
                parent['children'].append(node)


    for n, node in enumerate(getnodes(tree)):
        node['id'] = 'FT{0:05d}'.format(n + 1)


    j = json.dumps(tree, indent=args.indent)
    args.output.write(j + '\n')
    sys.exit()


def getnodes(d, nodes=None):
    if nodes is None:
        nodes = []
    nodes.append(d)
    if 'children' in d:
        for i in d['children']:
            getnodes(i, nodes)
    return nodes


if __name__ == '__main__':
    main()
