const log4js = require('log4js');

// LOG LEVELS:
// ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK < OFF


// Define the log configuration
// const logconfig = 
//  {
//      appenders: { 
//          fileAppender: { type: 'file', filename: './logs/example-11.log' },      // Log to a file
//          console: { type: 'console' },                                           // Log to console
//          consoleAppender: {                                                      // Formatting for console output
//              type: 'console', 
//              layout: { 
//                  type: 'pattern', 
//                  pattern: '%d - %c:[%p]: %m' 
//              } 
//          } 
//      },
//      categories: { 
//          default: { appenders: ['fileAppender'], level: 'info' },                // normal console
//          // OR
//          default: { appenders: ['consoleAppender'], level: 'info' }              // formatted console
//      }
//  }

const conf = {
    appenders:{
        console:{
            type:"stdout",
            layout: {
                type: 'pattern', 
                // Pattern with: date+time, log level, context, message (@file:line)
                pattern: '%d %[%p %c %m%] \t(@%f{1}:%l) '
            }
        },  
        file:{
            type:"file", 
            filename:"./logs/api.log", maxLogSize:2048000, backups:3, compress: true, keepFileExt: true,
            layout: {
                type: 'pattern', 
                pattern: '%d %p %c %m \t(@%f{1}:%l) '
            }
        }
    }, 
    categories:{
        default:{appenders:["console", "file"], level:"warn", enableCallStack: true}
    }
}
 
log4js.configure(conf);
const logger=log4js.getLogger();

logger.level="all"

/* ------------------------------------------------------------------
    MODULE EXPORTS
-------------------------------------------------------------------*/

module.exports = {
    logger
}