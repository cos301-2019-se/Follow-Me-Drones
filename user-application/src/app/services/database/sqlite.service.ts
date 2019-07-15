import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { DatabaseImplementationService } from './database-implementation.service';

export class SqliteService extends DatabaseImplementationService {
  sqlite: SQLite;
  DB_NAME = 'FMDS.db';
  constructor() {
    super();
    this.sqlite = new SQLite();
    this.createDb();
    this.exe();
  }
  exe() {
    this.sqlite.create({
      name: this.DB_NAME,
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        db.executeSql('insert into drone VALUES("255-255-255", "DRONE1", "10.0.0.1", 2000, "/var/hello")', [])
          .then((data) => alert(`data => successs input`))
          .catch(e => alert('row exists'));


      })
      .catch(e => alert(e));

    this.sqlite.create({
      name: this.DB_NAME,
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        db.executeSql('SELECT * FROM drone', [])
          .then((data) => alert(`data => ${JSON.stringify(data)}`))
          .catch(e => alert(e));


      })
      .catch(e => alert(e));

    // this.sqlite.deleteDatabase({
    //   name: this.DB_NAME,
    //   location: 'default'
    // })
    //   .then(() => {
    //     alert('deleted');
    //   })
    //   .catch(e => alert(e));
  }
  createDb() {
    this.sqlite.create({
      name: this.DB_NAME,
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        db.executeSql('CREATE TABLE `drone` ( `ID` CHAR(36), \
          `NAME` VARCHAR(255), `IP_ADDRESS`  VARCHAR(30),  \
          `PORT` INT unsigned, `ICON` VARCHAR(255), \
           PRIMARY KEY (`ID`));', [])

          .then(() => alert('Executed SQL'))
          .catch(e => alert('data-base exists'));
      })
      .catch(e => alert(JSON.stringify(e)));
  }
}


