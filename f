with open('README.md', 'r') as f:
    content = f.read()

old_section = '''| Bundle | Slot | Tip | Status |
|---|---|---|---|
| 5903fcb143... | 423180065 | 2000 | \u2705 Finalized |
| 52229d0c38... | 423180146 | 1182 | \u2705 Finalized |
| a974b083da... | 423180245 | 5000 | \u2705 Finalized |
| 76ee9a9061... | 423180355 | 1200 | \u2705 Finalized |
| 5df04c273b... | 423180442 | 5000 | \u2705 Finalized |
| 4fd64baee6... | 423180521 | 5000 | \u2705 Finalized |
| 77fee7f7c5... | 423180580 | 1000 | \u2705 Finalized |
| f6139d1b89... | 423180618 | 5000 | \u2705 Finalized |
| 5c2eaccc6d... | 423180777 | 6427 | \U0001f534 Fault Injection 1 |
| 0ba01c519e... | 423180835 | 1070 | \U0001f534 Fault Injection 2 |'''

new_section = '''\
**\u2705 Bundle 1** \u2014 Slot `423180065` \u2014 Tip `2000` lamports
```
5903fcb1434853a04a71f3c8b1f67b5f9489711ea317872bb55c7e8f6ada2ecb
```

**\u2705 Bundle 2** \u2014 Slot `423180146` \u2014 Tip `1182` lamports
```
52229d0c3839f0cf7f2091b1ac79d6f9ab43feb0ede48b230a70d699ce89415c
```

**\u2705 Bundle 3** \u2014 Slot `423180245` \u2014 Tip `5000` lamports
```
a974b083da0061f2a298c39b4dd046048625325832bab74caecdae5696c7c712
```

**\u2705 Bundle 4** \u2014 Slot `423180355` \u2014 Tip `1200` lamports
```
76ee9a906114122505331ec2c30ced81c99806c25c7e35c08955855112e0091d
```

**\u2705 Bundle 5** \u2014 Slot `423180442` \u2014 Tip `5000` lamports
```
5df04c273b1ec4c0d60120dac5e008cb04ca8157a839f51ce803b6f1191ca85f
```

**\u2705 Bundle 6** \u2014 Slot `423180521` \u2014 Tip `5000` lamports
```
4fd64baee6dc268317aa72561e8208e8e3599be2d4e8bb7e3100c3d2e01ebb1e
```

**\u2705 Bundle 7** \u2014 Slot `423180580` \u2014 Tip `1000` lamports
```
77fee7f7c50c35625c547a8fa5b24f4665d5c5a86c666436f0685f7b14e14308
```

**\u2705 Bundle 8** \u2014 Slot `423180618` \u2014 Tip `5000` lamports
```
f6139d1b8980fbebc21f5835206bb669ac6296d7b1ac6f634009b1009dab667b
```

**\U0001f534 Fault Injection 1** \u2014 Slot `423180777` \u2014 Tip `6427` lamports \u2014 Blockhash Expiry Simulated
```
5c2eaccc6d3020330a6a1fd72155583b477ede7a5cd3a3decbed8bb3664f1f9a
```

**\U0001f534 Fault Injection 2** \u2014 Slot `423180835` \u2014 Tip `1070` lamports \u2014 Blockhash Expiry Simulated
```
0ba01c519e5bc07d9fd3a8dca8957684e6f7d1b90759f6aafbcc8ce1c0357e36
```'''

if old_section in content:
    content = content.replace(old_section, new_section)
    with open('README.md', 'w') as f:
        f.write(content)
    print('SUCCESS: Bundle section fixed')
else:
    print('Section not found - trying line 335...')
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'Bundle' in line and 'Slot' in line and 'Tip' in line:
            print(f'Found at line {i+1}: {line}')
