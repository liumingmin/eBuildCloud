function PageComponent(start,limit,createListCallback) {
  this.start = start;
	this.limit = limit;
 	this.total = 0;
	this.callback = createListCallback;
  this.loadState = false;
	this.isAppend = false;

  this.getPageParam = function(){
		return {"__start":this.start+"","__limit":this.limit+""};
	}

	this.getIsAppend = function(){
		return this.isAppend;
	}

	this.setLoadState = function(loadstate){
    this.loadState = loadstate
		if(!loadstate){
			 this.start += this.limit ;
		}
	}

	this.getLoadState = function(){
		return this.loadState;
	}

	this.setTotal = function(total){
    this.total=total;
	}

	this.load = function(start) {
			if(!this.loadState){
				 if(start)
				 	this.start= start;
				else
					this.start=0;

				 this.isAppend = false;
				 createListCallback(this);
			}
	}

	this.loadMore = function(){
		if(!this.loadState && this.start<this.total){
			 this.isAppend = true;
			 createListCallback(this);
		}
	}
};



function ContactPageComponent(pageIndex,count,createListCallback) {
  this.pageIndex = pageIndex;
	this.count = count;
 	this.total = 0;
	this.callback = createListCallback;
  this.loadState = false;
	this.isAppend = false;

  this.getPageParam = function(){
		return {"pageIndex":this.pageIndex,"count":this.count};
	}

	this.getIsAppend = function(){
		return this.isAppend;
	}

	this.setLoadState = function(loadstate){
    this.loadState = loadstate
		if(!loadstate){
			 ++this.pageIndex;
		}
	}

	this.getLoadState = function(){
		return this.loadState;
	}

	this.setTotal = function(total){
    this.total=total;
	}

	this.load = function(pageIndex) {
			if(!this.loadState){
				 if(pageIndex>=0)
				 	this.pageIndex= pageIndex;
				else
					this.pageIndex=0;

				 this.isAppend = false;
				 createListCallback(this);
			}
	}

	this.loadMore = function(){
		if(!this.loadState && this.pageIndex<(this.total/this.count+2)){
			 this.isAppend = true;
			 createListCallback(this);
		}
	}
};
