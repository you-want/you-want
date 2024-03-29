const downloadUrl = require('download')
const gitclone = require('./gitclone')

const rm = require('rimraf').sync

/**
 * Download `repo` to `dest` and callback `fn(err)`.
 *
 * @param {String} repo
 * @param {String} dest
 * @param {Object} opts
 * @param {Function} fn
 */

function download(repo, dest, opts, fn) {
    if (typeof opts === 'function') {
        fn = opts
        opts = null
    }
    opts = opts || {}
    var clone = opts.clone || false
    var type = opts.type || 'https'
    repo = normalize(repo)
    console.log(2222, repo, type, opts.type, typeof opts.type);
    var url = repo.url || getUrl(repo, clone)
    console.log(3333, repo);
    if (clone) {
        console.log(1111, type, url, clone, dest, repo, fn)
        if (type == 'https') {
            console.log(5555, url, clone, dest, repo, fn)
            gitclonehttp(url, clone, dest, repo, fn)
        } else {
            gitclonessh(url, clone, dest, repo, fn)
        }
    } else {
        downloadUrl(url, dest, {
            extract: true,
            strip: 1,
            mode: '666',
            headers: {
                accept: 'application/zip'
            }
        })
        .then(function (data) {
            fn()
        })
        .catch(function (err) {
            fn(err)
        })
    }
}

function gitclonessh(url, clone, dest, repo, fn) {
    gitclone(url, dest, {
        checkout: repo.checkout,
        shallow: repo.checkout === 'master'
    }, function (err) {
        if (err === undefined) {
            rm(dest + '/.git')
            fn()
        } else {
            fn(err)
        }
    })
}

function gitclonehttp(url, clone, dest, repo, fn) {
    gitclone(getUrl(repo, clone, 'https'), dest, {
        checkout: repo.checkout,
        shallow: repo.checkout === 'master'
    }, function (err) {
        if (err === undefined) {
            rm(dest + '/.git')
            fn()
        } else {
            gitclonessh(url, clone, dest, repo, fn)
            // fn(err)
        }
    })
}

/**
 * Normalize a repo string.
 *
 * @param {String} repo
 * @return {Object}
 */
function normalize(repo) {
    var regex = /^(?:(direct):([^#]+)(?:#(.+))?)$/
    var match = regex.exec(repo)

    if (match) {
        var url = match[2]
        var checkout = match[3] || 'master'

        return {
            type: 'direct',
            url: url,
            checkout: checkout
        }
    } else {
        regex = /^(?:(github|gitlab|bitbucket):)?(?:(.+):)?([^\/]+)\/([^#]+)(?:#(.+))?$/
        match = regex.exec(repo)
        var type = match[1] || 'github'
        var origin = match[2] || null
        var owner = match[3]
        var name = match[4]
        var checkout = match[5] || 'master'

        if (origin == null) {
            if (type === 'github')
                origin = 'github.com'
            else if (type === 'gitlab')
                origin = 'gitlab.com'
            else if (type === 'bitbucket')
                origin = 'bitbucket.com'
        }

        return {
            gurl: match[0].replace(/(github|gitlab|bitbucket):/, ''),
            type: type,
            origin: origin,
            owner: owner,
            name: name,
            checkout: checkout
        }
    }
}

/**
 * Adds protocol to url in none specified
 *
 * @param {String} url
 * @return {String}
 */
function addProtocol(origin, clone) {
    if (!/^(f|ht)tps?:\/\//i.test(origin)) {
        if (clone)
            origin = 'git@' + origin
        else
            origin = 'https://' + origin
    }
    return origin
}

/**
 * Return a zip or git url for a given `repo`.
 *
 * @param {Object} repo
 * @return {String}
 */
function getUrl(repo, clone, type) {
    var url
    var origin
    // Get origin with protocol and add trailing slash or colon (for ssh)
    if (type) {
        origin = addProtocol(repo.gurl, false).replace(/:/g, '/').replace(/https\//, 'https:')
        console.log(6666, origin);
    } else {
        origin = addProtocol(repo.origin, true)
        if (/^git\@/i.test(origin))
            origin = origin + ':'
        else
            origin = origin + '/'
    }
    // Build url
    if (clone) {
        url = type ? origin + '.git' : origin + repo.owner + '/' + repo.name + '.git'
        console.log(7777, url);
    } else {
        if (repo.type === 'github')
            url = origin + repo.owner + '/' + repo.name + '/archive/' + repo.checkout + '.zip'
        else if (repo.type === 'gitlab')
            url = origin + repo.owner + '/' + repo.name + '/repository/archive.zip?ref=' + repo.checkout
        else if (repo.type === 'bitbucket')
            url = origin + repo.owner + '/' + repo.name + '/get/' + repo.checkout + '.zip'
    }
    return url
}
/**
 * Expose `download`.
 */

module.exports = download