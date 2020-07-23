/*
 * A simple model for tree filter
 */

export default class Filter {
  treeId
  //status
  dateStart
  dateEnd
  approved
  active
  planterId
  deviceId
  planterIdentifier
  speciesId

  constructor(options) {
    Object.assign(this, options)
  }

  getBackloopString(includeFilterString = true) {
    //{{{
    let result = ''
    const prefix = includeFilterString ? '&filter[where]' : '&where'

    if (this.treeId) {
      result += `${prefix}[id]=${this.treeId}`
    }

    //		if(this.status){
    //			result		+= `${prefix}[status]=${this.status.toLowerCase()}`
    //		}

    if (this.dateStart && this.dateEnd) {
      result += `${prefix}[timeCreated][between]=${this.dateStart}${prefix}[timeCreated][between]=${this.dateEnd}`
    } else if (this.dateStart && !this.dateEnd) {
      result += `${prefix}[timeCreated][gte]=${this.dateStart}`
    } else if (!this.dateStart && this.dateEnd) {
      result += `${prefix}[timeCreated][lte]=${this.dateEnd}`
    }

    if (this.approved !== undefined) {
      result += `${prefix}[approved]=${this.approved}`
    }

    if (this.active !== undefined) {
      result += `${prefix}[active]=${this.active}`
    }

    if (this.planterId !== undefined && this.planterId.length > 0) {
      result += `${prefix}[planterId]=${this.planterId}`
    }

    if (this.deviceId !== undefined && this.deviceId.length > 0) {
      result += `${prefix}[deviceId]=${this.deviceId}`
    }

    if (this.planterIdentifier !== undefined && this.planterIdentifier.length > 0) {
      result += `${prefix}[planterIdentifier]=${this.planterIdentifier}`
    }

    if (this.speciesId) {
      result += `${prefix}[speciesId]=${this.speciesId}`
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
  filter = (element) => {
    if (this.active !== undefined && this.active !== element.active) {
      return false
    } else if (this.approved !== undefined && this.approved !== element.approved) {
      return false
    } else if (this.status !== undefined && this.status !== element.status) {
      return false
    } else {
      return true
    }
  }
}
