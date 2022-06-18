# LetsEncrypt Folder Tool and API

## Install as CLI Tool
`npm i -g https://github.com/7c/lefolder`

## Install for API
`npm i https://github.com/7c/lefolder`

## CLI OPTIONS
```
lefolder
            [--errors|--valids] : show only the one with errors/valids
            [--json]  : show output in json format, default plain
            [<domain>[<domain2>]] : show only certain domains
```

### JSON FORMAT OUTPUT 
```
{
  source: '/etc/letsencrypt/renewal/7.xconfig.test.com.conf',
  domains: [ '7.xconfig.test.com' ],
  version: '0.40.0',
  archive_dir: '/etc/letsencrypt/archive/7.xconfig.test.com',
  files: {
    cert: '/etc/letsencrypt/live/7.xconfig.test.com/cert.pem',
    privkey: '/etc/letsencrypt/live/7.xconfig.test.com/privkey.pem',
    chain: '/etc/letsencrypt/live/7.xconfig.test.com/chain.pem',
    fullchain: '/etc/letsencrypt/live/7.xconfig.test.com/fullchain.pem'
  },
  expired: false,
  cert: {
    subject: '7.xconfig.test.com',
    altnames: [ '7.xconfig.test.com' ],
    _issuedAt: 2022-06-10T23:04:54.000Z,
    _expiresAt: 2022-09-08T23:04:53.000Z,
    issuedAt: 1654902294000,
    expiresAt: 1662678293000
  },
  errors: []
}
```


## API
<coming soon>