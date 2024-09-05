const kerberos = require('kerberos')
const https = require("https")
const axios = require('axios')
const webhdfs = require('webhdfs')
const fs = require('fs')
const path = require('path')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
const connectToHDFS = async () => {

    try {
        // const kerberosClienrt = await kerberos.initializeClient('HTTP/localhost')
        // const ticket = await kerberosClienrt.step('')
        // console.log(JSON.stringify(kerberosClienrt))
        // // const agent = new https.Agent({
        // //     rejectUnauthorized: false
        // // })
        // const options = {
        //     // httpsAgent: agent,
        //     headers: {
        //         'Authorization': `Negotiate ${ticket}`,
        //         'Content-Type': 'application/octet-stream'
        //     },
        // }

        const client = new webhdfs.createClient({
            user:"aurav",
            host: "127.0.0.1",
            port: 50070,
            protocol: 'http',
        })
        
        try {
            const res = await axios.get('http://127.0.0.1:50070/webhdfs/v1/?op=LISTSTATUS')
            // console.log(res.data.Token.urlString)

            // const res1 = await axios.put(`https://edlvduna002.ubimarigold.in:14000/webhdfs/v1/?op=CANCELDELEGATIONTOKEN&token=${res.data.Token.urlString}`, options)
            // console.log(res1.data)
            // const res1 = await axios.get(`https://edlvduna002.ubimarigold.in:14000/webhdfs/v1/ENCRYPTED_LDZ/GAP?op=LISTSTATUS&delegation=${res.data.Token.urlString}`, options) 
            // console.log(res1.data.FileStatuses.FileStatus)
            //    const {data} = await axios.put(`https://edlvduna002.ubimarigold.in:14000/webhdfs/v1/ENCRYPTED_LDZ/GAP/hello.txt?user.name=edlgapdev&op=create&overwrite=true&permission=0755&flag=w&delegation=${res.data.Token.urlString}`, 'Hello World', options)
            //     console.log(data)

             client.readdir('/ENCRYPTED_LDZ/FLATFILES',(err,files)=>{
                    if(err){
                        console.log(err)
                    }
                    console.log(files)
            })
            // const { data } = await axios.get(`https://edlvduna002.ubimarigold.in:14000/webhdfs/v1/ENCRYPTED_LDZ/GAP?op=LISTSTATUS&delegation=${res.data.Token.urlString}`)
            // console.log(data.FileStatuses.FileStatus)
            //    const res = await axios.get('https://edlvduna002.ubimarigold.in:14000/webhdfs/v1/?op=GETDELEGATIONTOKEN', options) 
            //    console.log(res.data.Token.urlString)
            var localFileStream = fs.createReadStream(path.resolve(__dirname, './hello.txt'))

            var remoteStream = client.createWriteStream('/ENCRYPTED_LDZ/FLATFILES/GAP/hello.txt')
            localFileStream.pipe(remoteStream)

            remoteStream.on('error', (err) => {
                console.log(err.message)

            })

            remoteStream.on('finish', () => {
                console.log('upload dones')
            })


            // const remoteReadFileStream = client.createReadStream('/ENCRYPTED_LDZ/GAP/hello.txt', {
            //     flag: 'r',
            //     delegation: `${res.data.Token.urlString}`
            // })
            
            // let chunks;
            // remoteReadFileStream.on('data',(chunk)=>{
            //     chunks +=chunk
                
            // })
                
            // remoteReadFileStream.on('error',(err)=>{
            //    console.log(err.message)

            // })
            
            // remoteReadFileStream.on('finish',()=>{
            //     const buffer = Buffer.from(chunks)
            //     console.log(buffer.toString('utf-8'),'yoyoyo')

            // })

        } catch (error) {
            console.log(error.message)
        }

    } catch (error) {
        console.log(error.message)
    }
}

connectToHDFS()
