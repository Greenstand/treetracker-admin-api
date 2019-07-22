import Filter		from './Filter'

describe('Filter', () => {
	let filter
	
	beforeEach(() => {
		filter		= new Filter()
		filter.treeId		= 10
		filter.status		= 'Planted'
		filter.dateStart		= '2019-07-25'
		filter.dateEnd		= '2019-07-30'
	})

	it('getBackloopString() should be: ', () => {
		console.log(filter.getBackloopString())
		expect(filter.getBackloopString().indexOf('&filter[where][id]=10') >= 0).toBe(true)
		expect(filter.getBackloopString().indexOf('&filter[where][status]=planted') >=0).toBe(true)
		expect(filter.getBackloopString().indexOf('&filter[where][timeCreated][between]=2019-07-25&filter[where][timeCreated][between]=2019-07-30') >=0).toBe(true)
	})

	describe('remove dateStart', () => {
		//{{{
		beforeEach(() => {
			delete filter.dateStart
		})

		it('should be lte', () => {
			console.log(filter.getBackloopString())
			expect(filter.getBackloopString().indexOf('&filter[where][timeCreated][lte]=2019-07-30') >=0).toBe(true)
		})
		//}}}
	})

	describe('remove dateEnd', () => {
		//{{{
		beforeEach(() => {
			delete filter.dateEnd
		})

		it('should be gte', () => {
			console.log(filter.getBackloopString())
			expect(filter.getBackloopString().indexOf('&filter[where][timeCreated][gte]=2019-07-25') >=0).toBe(true)
		})
		//}}}
	})

})
