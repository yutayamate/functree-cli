# functree-cli
![functree-cli](docs/logo.png)

## Description
functree-cli is a command-line tool, which allows user to visualize, customize, and compute statistical test to understand the biological functionality of their omics data.

functree-cli allows user to map their omics data on to a pre-defined treemap, which is based on the [KEGG BRITE](http://www.genome.jp/kegg/brite.html) or [EnteroPathway](http://www.enteropathway.org/) database.

This allows user to quickly and comprehensively understand the functional potential of their data, and to develop further hypothesis and scientific insights.

## Requirements
- node >= 4.6.0

## Installation
Clone this repository:
```
$ git clone http://tsubaki.bio.titech.ac.jp/yyamate/functree-cli.git
```
Enter the cloned directory:
```
$ cd functree-cli
```
Install functree-cli to your system using npm:
```
$ npm install -g
```

## Usage
```

_____ _   _ _   _  ____ _____ ____  _____ _____       ____ _     ___
|  ___| | | | \ | |/ ___|_   _|  _ \| ____| ____|     / ___| |   |_ _|
| |_  | | | |  \| | |     | | | |_) |  _| |  _| _____| |   | |    | |
|  _| | |_| | |\  | |___  | | |  _ <| |___| |__|_____| |___| |___ | |
|_|    \___/|_| \_|\____| |_| |_| \_\_____|_____|     \____|_____|___|

[ A command-line based visualization tool for massive-scale omics data ]

Copyright (c) 2014-2016 Kurokawa Nakashima Yamada Lab, Tokyo Institute of
Technology.


Commands:
 create [options...]  Create a visualization
 stats [options...]   Statistical analysis

Options:
 --show-config  Show default configuration                            [boolean]
 --help         Show help                                             [boolean]
 --version      Show version number                                   [boolean]
```

## Reference
- Uchiyama T, Irie M, Mori H, Kurokawa K, Yamada T. FuncTree: Functional Analysis and Visualization for Large-Scale Omics Data. PLoS One. 2015 May 14;10(5):e0126967. doi: 10.1371/journal.pone.0126967. eCollection 2015. PubMed PMID: 25974630; PubMed Central PMCID: PMC4431737.

## License
See `LICENSE` file.
