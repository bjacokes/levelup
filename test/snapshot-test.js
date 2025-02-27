var delayed = require('delayed').delayed
var trickle = require('trickle')
var discardable = require('./util/discardable')
var readStreamContext = require('./util/rs-context')

module.exports = function (test, testCommon) {
  test('ReadStream implicit snapshot', function (t) {
    discardable(t, testCommon, function (db, done) {
      var ctx = readStreamContext(t)

      // 1) Store 100 random numbers stored in the database
      db.batch(ctx.sourceData.slice(), function (err) {
        t.ifError(err, 'no batch error')

        // 2) Create an iterator on the current data, pipe it through a slow stream
        //    to make *sure* that we're going to be reading it for longer than it
        //    takes to overwrite the data in there.

        var rs = db.readStream().pipe(trickle({ interval: 5 }))

        rs.on('data', ctx.dataSpy)
        rs.once('end', ctx.endSpy)
        rs.once('close', delayed(function () {
          ctx.verify()
          done()
        }, 0.05))

        process.nextTick(function () {
          // 3) Concoct and write new random data over the top of existing items.
          //    If we're not using a snapshot then then we'd expect the test
          //    to fail because it'll pick up these new values rather than the
          //    old ones.
          var newData = []
          var i
          var k

          for (i = 0; i < 100; i++) {
            k = (i < 10 ? '0' : '') + i
            newData.push({
              type: 'put',
              key: k,
              value: Math.random()
            })
          }

          db.batch(newData.slice(), function (err) {
            t.ifError(err, 'no batch error')
            // we'll return here faster than it takes the readStream to complete
          })
        })
      })
    })
  })
}
