export namespace main {
	
	export class Session {
	    uid: string;
	    name: string;
	    handle: string;
	    icon: string;
	    dataDir: string;
	    signed: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Session(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uid = source["uid"];
	        this.name = source["name"];
	        this.handle = source["handle"];
	        this.icon = source["icon"];
	        this.dataDir = source["dataDir"];
	        this.signed = source["signed"];
	    }
	}

}

