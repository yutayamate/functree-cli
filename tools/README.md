# functree-cli tools
This directory includes supplementary scripts for **functree-cli**.

## Installing dependencies
**funcree-cli tools** requires [NumPy](https://github.com/numpy/numpy), [SciPy](https://github.com/scipy/scipy) and [Pandas](https://github.com/pandas-dev/pandas) packages. You can easily install these packages using [pip](https://pip.pypa.io) in the following command.
```
$ pip3 install -r requirements.txt
```

## Usage
### FuncTree reference JSON generator
:warning: This section is currently under construction.
```
$ python3 get.py -d kegg -o kegg.json
```

### FuncTree statistical analysis tool
:warning: This section is currently under construction.
```
$ python3 stats.py -d kegg -m mean -i table_ko.tsv -o table_brite.tsv
```
