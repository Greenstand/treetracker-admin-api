import Filter		from './Filter'

describe('Filter, with initial values about this filter object', () => {
	let filter
	
	beforeEach(() => {
		filter		= new Filter()
		filter.treeId		= 10
		filter.status		= 'Planted'
		filter.dateStart		= '2019-07-25'
		filter.dateEnd		= '2019-07-30'
		filter.approved		= true
		filter.active		= true
		filter.planterId		= '1'
		filter.deviceId		= '1'
		filter.planterIdentifier		= '1'
	})

	it('getBackloopString() should be: ', () => {
		console.log(filter.getBackloopString())
		expect(filter.getBackloopString().indexOf('&filter[where][id]=10') >= 0).toBe(true)
		expect(filter.getBackloopString().indexOf('&filter[where][status]=planted') >=0).toBe(true)
		expect(filter.getBackloopString().indexOf('&filter[where][timeCreated][between]=2019-07-25&filter[where][timeCreated][between]=2019-07-30') >=0).toBe(true)
	})

	it('getBackloopString(false) should be: ', () => {
		console.log(filter.getBackloopString(false))
		expect(filter.getBackloopString(false).indexOf('&where[id]=10') >= 0).toBe(true)
		expect(filter.getBackloopString(false).indexOf('&where[status]=planted') >=0).toBe(true)
		expect(filter.getBackloopString(false).indexOf('&where[timeCreated][between]=2019-07-25&where[timeCreated][between]=2019-07-30') >=0).toBe(true)
	})

	it('getBackloopString() should match: approved=true', () => {
		expect(filter.getBackloopString().indexOf('&filter[where][approved]=true') >= 0).toBe(true)
	})

	it('getBackloopString() should match: active=true', () => {
		expect(filter.getBackloopString().indexOf('&filter[where][active]=true') >= 0).toBe(true)
	})

	describe('change approved = false', () => {
		//{{{
		beforeEach(() => {
			filter.approved		= false
		})

		it('getBackloopString() should be approved=false', () => {
			expect(filter.getBackloopString().indexOf('&filter[where][approved]=false') >= 0).toBe(true)
		})

		//}}}
	})

	it('getBackloopString() should match: planterId=1', () => {
		expect(filter.getBackloopString().indexOf('&filter[where][planterId]=1') >= 0).toBe(true)
	})

	it('getBackloopString() should match: deviceId=1', () => {
		expect(filter.getBackloopString().indexOf('&filter[where][deviceId]=1') >= 0).toBe(true)
	})

	it('getBackloopString() should match: planterIdentifier=1', () => {
		expect(filter.getBackloopString().indexOf('&filter[where][planterIdentifier]=1') >= 0).toBe(true)
	})

	describe('set treeId = ""', () => {
		//{{{
		beforeEach(() => {
			filter.treeId		= ''
		})

		it('backloop string should not match any [id]', () => {
			expect(filter.getBackloopString().indexOf('[id]') < 0).toBe(true)
		})
		//}}}
	})

	describe('set planterId = ""', () => {
		//{{{
		beforeEach(() => {
			filter.planterId		= ''
		})

		it('backloop string should not match any [planterId]', () => {
			console.error('the where:', filter.getBackloopString())
			expect(filter.getBackloopString().indexOf('[planterId]') < 0).toBe(true)
		})
		//}}}
	})

	describe('set deviceId = ""', () => {
		//{{{
		beforeEach(() => {
			filter.deviceId		= ''
		})

		it('backloop string should not match any deviceId', () => {
			expect(filter.getBackloopString().indexOf('deviceId') < 0).toBe(true)
		})
		//}}}
	})

	describe('set planterIdentifier = ""', () => {
		//{{{
		beforeEach(() => {
			filter.planterIdentifier		= ''
		})

		it('backloop string should not match any planterIdentifier', () => {
			expect(filter.getBackloopString().indexOf('planterIdentifier') < 0).toBe(true)
		})
		//}}}
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

	describe('new Filter({approved:false})', () => {
		//{{{
		beforeEach(() => {
			filter		= new Filter({
				approved		: false,
			})
		})

		it('filter.approved should be false', () => {
			expect(filter.approved).toBe(false)
		})

		//}}}
	})

	describe('a data array', () => {
		//{{{
		let data

		beforeEach(() => {
			data		= [{
				id		: 'a',
				active		: true,
				approved		: false,
			},{
				id		: 'b',
				active		: true,
				approved		: true,
			},{
				id		: 'c',
				active		: false,
				approved		: true,
			}]
		})

		describe('new Filter({active: true, approved:false})', () => {
			//{{{
			let filter

			beforeEach(() => {
				filter		= new Filter({
					active		: true,
					approved		: false,
				})
			})

			it('filter() should get a ', () => {
				expect(data.filter(filter.filter)).toHaveLength(1)
				expect(data.filter(filter.filter)[0].id).toBe('a')
			})

			//}}}
		})

		describe('new Filter({active: false, approved:true})', () => {
			//{{{
			let filter

			beforeEach(() => {
				filter		= new Filter({
					active		: false,
					approved		: true,
				})
			})

			it('filter() should get c ', () => {
				expect(data.filter(filter.filter)).toHaveLength(1)
				expect(data.filter(filter.filter)[0].id).toBe('c')
			})

			//}}}
		})


		//}}}
	})


})
