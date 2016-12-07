# FuncTree-CLI
```
_____ _   _ _   _  ____ _____ ____  _____ _____       ____ _     ___
|  ___| | | | \ | |/ ___|_   _|  _ \| ____| ____|     / ___| |   |_ _|
| |_  | | | |  \| | |     | | | |_) |  _| |  _| _____| |   | |    | |
|  _| | |_| | |\  | |___  | | |  _ <| |___| |__|_____| |___| |___ | |
|_|    \___/|_| \_|\____| |_| |_| \_\_____|_____|     \____|_____|___|

[ A command-line based visualization tool for massive-scale omics data ]
```

## Description
**FuncTree-CLI** is a command-line tool, which allows user to visualize, customize, and compute statistical test to understand the biological functionality of their omics data. functree-cli allows user to map their omics data on to a pre-defined treemap, which is based on the [KEGG BRITE](http://www.genome.jp/kegg/brite.html) or [EnteroPathway](http://www.enteropathway.org/) database. This allows user to quickly and comprehensively understand the functional potential of their data, and to develop further hypothesis and scientific insights.

## Requirements
- [Node.js](https://github.com/nodejs/node) >= v6.9.1
- [Python](https://www.python.org/) >= v3.5.1


## Installation
Clone this repository:
```bash
$ git clone http://tsubaki.bio.titech.ac.jp/yyamate/functree-cli.git
```
Enter `functree-cli` directory:
```bash
$ cd functree-cli
```
Install FuncTree-CLI to your system using [npm](https://github.com/npm/npm):
```bash
$ npm install -g
```

## Usage
### Overview
Basic usage and available commands are listed below:
```bash
$ functree [command] [options...]
```
| Command / Option | Description |
|:--|:--|
| get [options...] | Get tree structure data |
| stats [options...] | Statistical analysis |
| create [options...] | Create visualization |
| --show-config | Show default configuration |
| --help | Show help |
| --version | Show version number |

### Get tree structure data
Before creating a visualization, you need to prepare tree structure data for data mapping.
FuncTree-CLI provides the simple way to get tree structure data from [KEGG BRITE](http://www.genome.jp/kegg/brite.html) in the following command.
```bash
$ functree get -d kegg -o kegg.json
```
Alternatively, you can use your own tree structure data. It must be JSON format and have the structure corresponded to the following example. You can also refer to [flare.json](https://gist.github.com/mbostock/1093025).
```json
{
  "id": "00001",
  "name": "path:map00010",
  "label": "Glycolysis / Gluconeogenesis",
  "depth": 0,
  "children": [
    {
      "id": "00002",
      "name": "md:M00001",
      "label": "Glycolysis (Embden-Meyerhof pathway), glucose => pyruvate",
      "depth": 1,
      "children": [
        {
          "id": "00003",
          "name": "ko:K00844",
          "label": "HK; hexokinase [EC:2.7.1.1]",
          "depth": 2
        },
        {
          "id": "00004",
          "name": "ko:K12407",
          "label": "GCK; glucokinase [EC:2.7.1.2]",
          "depth": 2
        }
      ]
    }
  ]
}
```

### Statistical analysis
This feature consists of following two steps:

1. **Evaluate functionality:** You can evaluate functionality for each nodes (functional categories) defined by input tree structure file. This feature requires KO-annotated abundance table which is separated by tabs.

    ```
    # This is comment
    	sample1	sample2	sample3
    ko:K00001	0.000218080750998678	0.000292011269409172	0.000183811396397214
    ko:K00002	1.66822340270918e-05	2.9109921924858197e-05	2.9970461739666497e-05
    ko:K00003	0.00010209658248844201	0.000267883926930514	0.00034744353401109
    ko:K00004	2.55973088845531e-06	1.1145349476428498e-06	7.774328858319991e-06
    ko:K00005	0.000104872989966464	7.822164009693009e-05	5.73637517684323e-05
    ```

1. **Compute statistical test:** If necessary, you can compute statistical tests for each nodes (functional categories) defined by input tree structure file. This feature requires **two** tab-separated tables calculated by the above feature.

Example usage and available options and  are listed below:

```bash
# Evaluate functionality
$ functree stats -d kegg.json -m mean -i ko_abundance.tsv -o functree_abundance.tsv

# Compute statistical test
$ functree stats -d kegg.json -m mannwhitneyu -i functree_abundance_1.tsv functree_abundance_2.tsv -o functree_pvalue.tsv
```

| Identifier | GNU-style | Description |
|:--|:--|:--|
| -i | --input | Specify input file(s) |
| -o | --output | Specify output file |
| -d | --database | Specify reference database |
| -m | --method | Specify analysis method |
| -c | --config | Specify configuration file |

### Creating visualization
This feature is the main part of FuncTree-CLI. This helps you create a insightful visualization with your own data. If necessary, you can specify output image format (SVG (default) or interactive HTML) with `-f, --format` option.

Example usage and available options and  are listed below:

```bash
$ functree create -d kegg.json -i functree_abundance.tsv -o functree_visualization.html -f html
```

| Identifier | GNU-style | Description |
|:--|:--|:--|:--|
| -t | --theme | Specify visualization theme
| -i | --input | Specify input file |
| -o | --output | Specify output file |
| -d | --database | Specify reference database |
| -f | --format | Specify output format |
| -c | --config | Specify configuration file |

## Building
1. Clone this repository.
1. Run `npm install` to install the dependencies.
1. Run `npm run build` to compile the ES6 codes (`src/*.js`).

## Reference
- Uchiyama T, Irie M, Mori H, Kurokawa K, Yamada T. FuncTree: Functional Analysis and Visualization for Large-Scale Omics Data. PLoS One. 2015 May 14;10(5):e0126967. doi: 10.1371/journal.pone.0126967. eCollection 2015. PubMed PMID: 25974630; PubMed Central PMCID: PMC4431737.

## License
See `LICENSE` file.
