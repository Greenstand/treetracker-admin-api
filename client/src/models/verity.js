/*
 * The model for verity page
 */
import * as loglevel		from 'loglevel'
import * as api		from '../api/treeTrackerApi'

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
				rowsPerPage: verityState.pageSize
			};
			log.debug('load page with params:', pageParams)
			const result		= await api.getTreeImages(pageParams)
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
//			for(let treeImage of verityState.treeImages){
//				log.trace('approve:%d', treeImage.id)
//				await this.approveTreeImage(treeImage.id)
//			}
			for(let i = 0; i < verityState.treeImages.length; i++){
				const treeImage		= verityState.treeImages[i]
				log.trace('approve:%d', treeImage.id)
				await this.approveTreeImage(treeImage.id)
				this.setApproveAllComplete(100 * ((i + 1) / total))
			}
			//mock
			for(let i = 0; i < verityState.treeImages.length; i++){
				const treeImage		= verityState.treeImages[i]
				await new Promise(r => {
					setTimeout(() => {
						this.approvedTreeImage(treeImage.id)
						this.setApproveAllComplete(100 * ((i + 1) / total))
						r(true)
					}, 300)
				})
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
	},
}

export default verity
