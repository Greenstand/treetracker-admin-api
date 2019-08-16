/*
 * The model for verity page
 */
import * as loglevel		from 'loglevel'
import api		from '../api/treeTrackerApi'
import FilterModel		from './Filter';

const log		= loglevel.getLogger('../models/verity')

const verity = {
	state		 : {
		treeImages		: [],
		isLoading		: false,
		isApproveAllProcessing		: false,
		//cal the complete of progress (0-100)
		approveAllComplete		: 0,
		pagesLoaded		: -1,
		moreTreeImagesAvailable		: true,
		pageSize		: 20,
		/*
		 * The default value means: image not approved yet, and not rejected yet too
		 */
		filter		: new FilterModel({
			approved		: false,
			active		: true,
		}),
	},
	reducers		: {
		appendTreeImages(state, treeImages){
      let newTreeImages = [...state.treeImages, ...treeImages]
      let newState = {
        ...state,
        treeImages: newTreeImages,
				pagesLoaded		: state.pagesLoaded + 1,
				isLoading		: false,
      };
      return newState;
		},
		setLoading(state, isLoading){
			return {
				...state,
				isLoading,
			};
		},
		setApproveAllProcessing(state, isApproveAllProcessing){
			return {
				...state,
				isApproveAllProcessing,
			}
		},
		setPagesLoaded(state, pagesLoaded){
			return {
				...state,
				pagesLoaded,
			}
		},
		setFilter(state, filter){
			return {
				...state,
				filter
			}
		},
		setApproveAllComplete(state, approveAllComplete){
			return {
				...state,
				approveAllComplete,
			}
		},
		approvedTreeImage(state, treeId){
      const treeImages = state.treeImages.filter(
        treeImage => treeImage.id !== treeId
      )
      return { ...state, treeImages: treeImages }
		},
		rejectedTreeImage(state, treeId){
      const treeImages = state.treeImages.filter(
        treeImage => treeImage.id !== treeId
      )
      return { ...state, treeImages: treeImages }
		},
		//to reset the page status, load from beginning
		reset(state){
			return {
				...state,
				treeImages		: [],
				pagesLoaded		: -1,
				moreTreeImagesAvailable		: true,
			}
		},
	},
	effects		: {
		/*
		 * approve a tree, given tree id
		 */
		async approveTreeImage(id){
			await api.approveTreeImage(id)
			this.approvedTreeImage(id)
			return true
		},
		/*
		 * reject a tree, given tree id
		 */
		async rejectTreeImage(id){
			await api.rejectTreeImage(id)
			this.rejectedTreeImage(id)
			return true
		},
		/*
		 * To load more trees into the list
		 */
		async loadMoreTreeImages(payload, state){
			//{{{
			log.debug('to load images')
			const verityState		= state.verity
			if (verityState.isLoading || !verityState.moreTreeImagesAvailable){
				log.debug('cancel load because condition doesn\'t meet')
				return true;
			}
			//set loading status
			this.setLoading(true)
			const nextPage = verityState.pagesLoaded + 1;
			const pageParams = {
				page: nextPage,
				rowsPerPage: verityState.pageSize,
				filter		: verityState.filter,
			};
			log.debug('load page with params:', pageParams)
			const result		= await api.getTreeImages(pageParams)
			log.debug('loaded trees:%d', result.length)
			//verityState.pagesLoaded = nextPage;
			this.appendTreeImages(result);
			//restore loading status
			this.setLoading(false)
			return true;
			//}}}
		},

		/*
		 * approve all tree
		 */
		async approveAll(payload, state){
			//{{{
			log.debug('approveAll with state:', state)
			this.setLoading(true);
			this.setApproveAllProcessing(true);
			const verityState		= state.verity;
			const total		= verityState.treeImages.length;
			log.debug('items:%d', verityState.treeImages.length);
			try{
				for(let i = 0; i < verityState.treeImages.length; i++){
					const treeImage		= verityState.treeImages[i]
					log.trace('approve:%d', treeImage.id)
					await this.approveTreeImage(treeImage.id)
					this.approvedTreeImage(treeImage.id)
					this.setApproveAllComplete(100 * ((i + 1) / total))
				}
	//			//mock
	//			for(let i = 0; i < verityState.treeImages.length; i++){
	//				const treeImage		= verityState.treeImages[i]
	//				await new Promise(r => {
	//					setTimeout(() => {
	//						this.approvedTreeImage(treeImage.id)
	//						this.setApproveAllComplete(100 * ((i + 1) / total))
	//						r(true)
	//					}, 300)
	//				})
	//			}
			}catch(e){
				log.warn('get error:', e)
				this.setLoading(false);
				this.setApproveAllProcessing(false);
				return false
			}
			//finished, set status flags
			this.setLoading(false);
			this.setApproveAllProcessing(false);
			//reset
			this.setPagesLoaded(-1);
			this.setApproveAllComplete(0);
			return true;
			//}}}
		},
		/*
		 * trigger when user submit filter form
		 */
		async updateFilter(filter){
			//{{{
			this.setFilter(filter)
			this.reset()
			//clear all stuff
			await this.loadMoreTreeImages()
			//}}}
		},
	},
}

export default verity
