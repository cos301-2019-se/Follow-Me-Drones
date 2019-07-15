import { DatabaseImplementationService } from './database-implementation.service';

export class DatabaseService {

  db: DatabaseImplementationService;
  constructor( db: DatabaseImplementationService) {
    console.log('main db created');
    this.db = db;
  }
}
