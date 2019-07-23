/*
 * A simple model for tree filter
 */

export default class Filter{
	treeId
	status
	dateStart
	dateEnd

	constructor(){
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

		return result
		//}}}
	}

}
