import Filter		from './Filter'

describe('Filter', () => {
	let filter
	
	beforeEach(() => {
		filter		= new Filter()
		filter.treeId		= 10
		filter.status		= 'Planted'
		filter.dateStart		= '2019-07-25'
		filter.dateEnd		= '2019-07-30'
		filter.approved		= true
		filter.active		= true
	})

	it('getBackloopString() should be: ', () => {
		console.log(filter.getBackloopString())
		expect(filter.getBackloopString().indexOf('&filter[where][id]=10') >= 0).toBe(true)
		expect(filter.getBackloopString().indexOf('&filter[where][status]=planted') >=0).toBe(true)
		expect(filter.getBackloopString().indexOf('&filter[where][timeCreated][between]=2019-07-25&filter[where][timeCreated][between]=2019-07-30') >=0).toBe(true)
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
