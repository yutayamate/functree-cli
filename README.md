# functree-cli
![logo](docs/logo.png)

## Description
**functree-cli** is a command-line tool, which allows user to visualize, customize, and compute statistical test to understand the biological functionality of their omics data.

![cli](docs/cli.png)

functree-cli allows user to map their omics data on to a pre-defined treemap, which is based on the [KEGG BRITE](http://www.genome.jp/kegg/brite.html) or [EnteroPathway](http://www.enteropathway.org/) database.

This allows user to quickly and comprehensively understand the functional potential of their data, and to develop further hypothesis and scientific insights.

## Requirements
- [node](https://github.com/nodejs/node) >= 4.6.0

## Installation
Clone this repository:
```
$ git clone http://tsubaki.bio.titech.ac.jp/yyamate/functree-cli.git
```
Enter `functree-cli` directory:
```
$ cd functree-cli
```
Install functree-cli to your system using npm:
```
$ npm install -g
```

## Usage
### CLI
Basic usage on CLI is below:
```
$ functree [command] [options...]
```
| Command | Description |
|:--|:--|
| get [options...] | Get reference dataset from KEGG / EnteroPathway |
| stats [options...] | Statistical analysis |
| create [options...] | Create a visualization |
| --show-config | Show default configuration |
| --help | Show help |
| --version | Show version number |

## Building
- Clone this repository.
- Run `npm install` to install the dependencies.
- Run `npm run build` to compile the ES6 codes (`src/*.js`).


## Reference
- Uchiyama T, Irie M, Mori H, Kurokawa K, Yamada T. FuncTree: Functional Analysis and Visualization for Large-Scale Omics Data. PLoS One. 2015 May 14;10(5):e0126967. doi: 10.1371/journal.pone.0126967. eCollection 2015. PubMed PMID: 25974630; PubMed Central PMCID: PMC4431737.

## License
See `LICENSE` file.
