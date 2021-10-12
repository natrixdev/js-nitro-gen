module.exports = (prefix = '', suffix = '', length = 16, random = true, amount = 1, debug = false, outfile) => {

    return new Promise(async (resolve) => {

        const fs = require('fs')
        const mkdirp = require('mkdirp')
        const { performance } = require('perf_hooks')
        const { rand, numberFormat } = require('./utils/')

        const E = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' //62
        const max = E.length-1

        const codes = []

        if (outfile) if (fs.existsSync(outfile)) fs.unlinkSync(outfile)

        const start = performance.now()

        if (random) {
            
            if (require.main == module) console.log(`Generating ${amount} codes of length ${length}.`)

            for (let n = 0; n < amount; n++) {
                let str = ''
                for (let i = 0; i < length; i++) {
                    str += E[Math.floor(rand(0, E.length-1))]
                }
                codes.push(prefix+str+suffix)
            }

        } else {

            const nmax = random ? E.length**length : amount

            if (require.main == module) console.log(`Generating ${numberFormat(nmax)} codes of length ${length}.`)

            let state = Array(length).fill(0)

            while (true && codes.length < nmax) {

                str = ''
                for (let i = 0; i < length; i ++) {
                    str += E[state[i]]
                }
                codes.push(prefix+str+suffix)
                if (debug) console.log(`[DEBUG] Generated ${numberFormat(codes.length)}/${numberFormat(nmax)} codes.`)

                let c = false
                for (let i = 0; i < length; i++) {
                    if (state[i] < max) {
                        state[i]++
                        c = true
                        for (let i2 = 0; i2 < i; i2++) { //reset previous
                            state[i2] = 0
                        }
                        break
                    } else if (state[i] == max) continue
                }
                if (!c) break

            }
        }
        
        const end = performance.now()

        if (outfile) {
            await mkdirp(outfile.match(/.*(\/|\\)/g)[0])
            const writeStream = fs.createWriteStream(outfile, { encoding: 'utf-8' })
            writeStream.write(codes.join('\n'))
            writeStream.close()
        }

        resolve( {start, end, codes} )
    })

}

if (require.main == module) {
    const { duration } = require('./utils')
    const { prefix, suffix, length, random, amount, debug, outfile } = require('./config.json').generator
    
    console.log(`Starting generation...`)
    module.exports(prefix, suffix, length, random, amount, debug, outfile).then(r => {
        console.info(`End of generation, ${r.codes.length} code(s) created ; took ${duration(r.end-r.start, true, true)}.`)
    })
}
