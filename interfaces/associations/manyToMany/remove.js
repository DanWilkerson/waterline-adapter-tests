var assert = require('assert');
var _ = require('@sailshq/lodash');

describe('Association Interface', function() {

  describe('n:m association :: .remove()', function() {
    describe('with an id', function() {

      /////////////////////////////////////////////////////
      // TEST SETUP
      ////////////////////////////////////////////////////

      var driverRecord, taxiRecords;

      before(function(done) {

        Associations.Driver.create({ name: 'manymany remove' })
        .exec(function(err, model) {
          if(err) return done(err);

          driverRecord = model;

          var taxis = [];
          for(var i=0; i<2; i++) {
            driverRecord.taxis.add({ medallion: i });
          }

          driverRecord.save(function(err) {
            if(err) return done(err);

            Associations.Driver.findOne(driverRecord.id)
            .populate('taxis')
            .exec(function(err, driver) {
              if(err) return done(err);
              taxiRecords = driver.toObject().taxis;
              done();
            });
          });
        });
      });

      /////////////////////////////////////////////////////
      // TEST METHODS
      ////////////////////////////////////////////////////

      it('should remove the record from the join table', function(done) {
        driverRecord.taxis.remove(taxiRecords[0].id);
        driverRecord.save(function(err) {
          assert.ifError(err);

          // Look up the driver again to be sure the taxi was removed
          Associations.Driver.findOne(driverRecord.id)
          .populate('taxis')
          .exec(function(err, data) {
            assert.ifError(err);

            assert.strictEqual(data.taxis.length, 1);
            done();
          });
        });
      });
    });

    describe('with an object', function() {

      /////////////////////////////////////////////////////
      // TEST SETUP
      ////////////////////////////////////////////////////

      var driverRecord;

      before(function(done) {
        Associations.Driver.create({ name: 'manymany remove' })
        .exec(function(err, model) {
          if(err) return done(err);
          driverRecord = model;
          done();
        });
      });

      /////////////////////////////////////////////////////
      // TEST METHODS
      ////////////////////////////////////////////////////

      it('should error when an object is passed in', function(done) {
        driverRecord.taxis.remove({ medallion: 1337 });
        driverRecord.save(function(err) {
          assert(err);
          assert(err.failedTransactions);
          assert(Array.isArray(err.failedTransactions));
          assert.strictEqual(err.failedTransactions.length, 1);
          assert.equal(err.failedTransactions[0].type, 'remove');

          done();
        });
      });
    });

  });
});
