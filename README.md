# FuncTree-CLI
```
       _____ _   _ _   _  ____ _____ ____  _____ _____       ____ _     ___
      |  ___| | | | \ | |/ ___|_   _|  _ \| ____| ____|     / ___| |   |_ _|
      | |_  | | | |  \| | |     | | | |_) |  _| |  _| _____| |   | |    | |
      |  _| | |_| | |\  | |___  | | |  _ <| |___| |__|_____| |___| |___ | |
      |_|    \___/|_| \_|\____| |_| |_| \_\_____|_____|     \____|_____|___|

[ Visualization and analysis tool for omics data based on biological functional tree ]
```

## Description
**FuncTree-CLI** is a command-line application, which allows user to visualize, customize, and compute statistical test to understand the biological functionality of their omics data. FuncTree allows user to map their omics data on to a pre-defined treemap, which is based on the [KEGG](http://www.genome.jp/kegg/) or other hierarchical functional databases. This allows user to quickly and comprehensively understand the functional potential of their data, and to develop further hypothesis and scientific insights.

## Example
FuncTree-CLI creates a hierarchical visualization. In the treemap nodes represent particular biological functions and edges represent hierarchical relationships between functional categories.

![example](docs/example.png)


## Requirements
- [Node.js](https://github.com/nodejs/node) >= v6.9.1
- [Python](https://www.python.org/) >= v3.5.1


## Installation
Clone this repository:
```bash
$ git clone https://github.com/yyuuta88/functree-cli.git
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
| get [options...] | Get tree structure data from database |
| stats [options...] | Perform statistical analysis |
| create [options...] | Create visualization |
| --show-config | Show default configuration value |
| --help | Show help |
| --version | Show version number |

### Get tree structure data from database
Before creating a visualization, you need to prepare tree structure data for data mapping.
FuncTree-CLI provides the simple way to get tree structure data from [KEGG](http://www.genome.jp/kegg/) in the following command.
```bash
$ functree get -d kegg -o kegg.json
```
However, you can use your own tree structure data for drawing treemap. It must be in the JSON format and have the structure corresponded to the following example.
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

### Perform statistical analysis
This feature consists of following two steps:

1. **Evaluate functionality:** If your omics data is only annotated by KEGG Orthology, you can evaluate functionality for all functional categories defined by input tree structure data (i.e. module, pathway etc.). This feature requires KO-annotated abundance table which is separated by tabs.

    ```
    # This is comment
    	sample1	sample2	sample3
    ko:K00001	0.000218080750998678	0.000292011269409172	0.000183811396397214
    ko:K00002	1.66822340270918e-05	2.9109921924858197e-05	2.9970461739666497e-05
    ko:K00003	0.00010209658248844201	0.000267883926930514	0.00034744353401109
    ko:K00004	2.55973088845531e-06	1.1145349476428498e-06	7.774328858319991e-06
    ko:K00005	0.000104872989966464	7.822164009693009e-05	5.73637517684323e-05
    ```

1. **Perform comparison between two groups:** If necessary, you can compute hypothesis test for all functional categories defined by input tree structure file (i.e. module, pathway etc.). This feature requires **two** tab-separated tables calculated by the above feature.

Example usage and available options and  are listed below:

```bash
# Evaluate functionality - Mean
$ functree stats -d kegg.json -m mean -i ko_abundance.tsv -o all_abundance.tsv

# Perform comparison between two groups - Mann-Whitney U test
$ functree stats -d kegg.json -m mannwhitneyu -i all_abundance_1.tsv all_abundance_2.tsv -o functree_pvalue.tsv
```

| Option | Long option | Description |
|:--|:--|:--|
| -i | --input | Path to input abundance table(s) |
| -o | --output | Output result to file |
| -d | --database | Path to tree structure data JSON file |
| -m | --method | Specify statistical analysis method |
| -c | --config | Path to configuration JSON file |

### Create visualization
This feature is the main part of FuncTree-CLI. This helps you create a insightful visualization with your own data. If necessary, you can specify output image format type (static SVG (default) or interactive HTML) with `-f, --format` option.

Example usage and available options and  are listed below:

```bash
$ functree create -d kegg.json -i all_abundance.tsv -o visualization.html -f html
```

| Option | Long option | Description |
|:--|:--|:--|
| -t | --theme | Specify theme of visualization |
| -i | --input | Path to input abundance table |
| -o | --output | Output visualization image to file |
| -d | --database | Path to tree structure data JSON file |
| -f | --format | Specify output format type |
| -c | --config | Path to configuration JSON file |

## Building
1. Clone this repository.
1. Run `npm install` to install the dependencies.
1. Run `npm run build` to compile the ES6 codes (`src/*.js`).

## Link
- FuncTree 2 - http://www.bioviz.tokyo/functree2/

## Reference
- Uchiyama T, Irie M, Mori H, Kurokawa K, Yamada T. FuncTree: Functional Analysis and Visualization for Large-Scale Omics Data. PLoS One. 2015 May 14;10(5):e0126967. doi: 10.1371/journal.pone.0126967. eCollection 2015. PubMed PMID: 25974630; PubMed Central PMCID: PMC4431737.

## License
See `LICENSE` file.
