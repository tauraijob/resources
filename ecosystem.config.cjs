module.exports = {
    apps: [
        {
            name: 'Webdev Resources Booking',
            port: '3012',
            exec_mode: 'cluster',
            instances: '1',
            script: './.output/server/index.mjs'
        }
    ]
}