/*
 * A simple model for tree filter
 */

export default class Filter{
	treeId
	status
	dateStart
	dateEnd
	approved
	active
	planterId
	deviceId
	planterIdentifier
  speciesId

	constructor(options){
		Object.assign(this, options)
	}

	getBackloopString(){
		//{{{
		let result		= ''

		if(this.treeId){
			result		+= `&filter[where][id]=${this.treeId}`
		}

		if(this.status){
			result		+= `&filter[where][status]=${this.status.toLowerCase()}`
		}

		if(this.dateStart && this.dateEnd){
			result		+= `&filter[where][timeCreated][between]=${this.dateStart}&filter[where][timeCreated][between]=${this.dateEnd}`
		}else if(this.dateStart && !this.dateEnd){
			result		+= `&filter[where][timeCreated][gte]=${this.dateStart}`
		}else if(!this.dateStart && this.dateEnd){
			result		+= `&filter[where][timeCreated][lte]=${this.dateEnd}`
		}

		if(this.approved !== undefined){
			result		+= `&filter[where][approved]=${this.approved}`
		}

		if(this.active !== undefined){
			result		+= `&filter[where][active]=${this.active}`
		}

		if(this.planterId !== undefined && this.planterId.length > 0){
			result		+= `&filter[where][planterId]=${this.planterId}`
		}

		if(this.deviceId !== undefined && this.deviceId.length > 0){
			result		+= `&filter[where][deviceId]=${this.deviceId}`
		}

		if(this.planterIdentifier !== undefined && this.planterIdentifier.length > 0){
			result		+= `&filter[where][planterIdentifier]=${this.planterIdentifier}`
		}

    if(this.speciesId){
			result		+= `&filter[where][speciesId]=${this.speciesId}`
    }

		return result
		//}}}
	}

	/* 
	 * A fn for array, to filter the data in memory, means, just use current 
	 * filter setting to filter an array
	 * usage: someArray.filter(thisFilter.filter)
	 * Note, not support start/end date yet.
	 */
	filter		= (element) => {
		if(
			this.active !== undefined && 
			this.active !== element.active
		){
			return false
		}else if(
			this.approved !== undefined &&
			this.approved !== element.approved
		){
			return false
		}else if(
			this.status !== undefined &&
			this.status !== element.status
		){
			return false
		}else{
			return true
		}
	}

}
