interface DatabaseOptions {

    host?:string;
    port?:number;
    protocol?:any;
    logging?:any;
    maxConcurrentQueries?:number;
    dialect?:string;
    storage?:string;
    omitNull?:boolean;
    native?:boolean;

    define?: {
        underscored?:boolean;
        freezeTableName?:boolean;
        syncOnAssociation?:boolean;
        charset?:string;
        collate?:string;
        clasMethods?:any;
        instanceMethods?:any;
        timetamps?:boolean;
    };

    sync?: {
        force?:boolean;
    };

    syncOnAssociation?:boolean;

    pool?: {
        maxConnections?:number;
        maxIdleTime?:number;
    };

    language?:string;
}

interface Model {
    sync(options?:{
        force?:boolean;
    });
    drop();
    build(options?:any);

    find(id:number);
    find(options?:any);
    findOrCreate(options?:any);
    create(options?:any);
    findAll();
    count();
    max(attribute:string);
    min(attribute:string);
    save();
    success(cb?:any);
    destroy(options?:any);

    belongsTo(model:Model);
    hasOne(model:Model, options?:any);
    hasMany(model:Model, options?:any);

}

declare module "sequelize" {}

declare class Sequelize {
    constructor(database:string, username:string, password:string, options?: any);

    define(model:string, options?:any): any;

    query(query:string, calee?:any, options?:any, replacements?:any);
}

export = Sequelize;