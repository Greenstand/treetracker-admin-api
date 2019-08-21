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
		/*
		 * The array of all current selected trees, user click to select true
		 * [treeId, treeId, ...]
		 */
		treeImagesSelected		: [],
		/*
		 * this is a tree id, used to assist selecting trees, when click a tree, 
		 * and press shift to select a range, then, need use this tree id to cal 
		 * the whole range
		 */
		treeImageAnchor		: undefined,
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
			//remove if selected
			const treeImagesSelected		= state.treeImagesSelected.filter(
				id => id !== treeId
			)
      return { 
				...state, 
				treeImages,
				treeImagesSelected,
			}
		},
		rejectedTreeImage(state, treeId){
      const treeImages = state.treeImages.filter(
        treeImage => treeImage.id !== treeId
      )
			//remove if selected
			const treeImagesSelected		= state.treeImagesSelected.filter(
				id => id !== treeId
			)
      return { 
				...state, 
				treeImages,
				treeImagesSelected,
			}
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
		/*
		 * to clear all selection
		 */
		resetSelection(state){
			return {
				...state,
				treeImagesSelected		: [],
				treeImageAnchor		: undefined,
			}
		},
		/*
		 * could we set reducer with a generic way?
		 */
		set(state, object){
			return {
				...state,
				...object,
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
				//page: nextPage,
				//REVISE Fri Aug 16 10:56:34 CST 2019
				//change the api to use skip parameter directly, because there is a 
				//bug to use page as param
				skip		: verityState.treeImages.length,
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
			const total		= verityState.treeImagesSelected.length;
			log.debug('items:%d', verityState.treeImages.length);
			try{
				for(let i = 0; i < verityState.treeImagesSelected.length; i++){
					const treeId		= verityState.treeImagesSelected[i]
					const treeImage		= verityState.treeImages.reduce((a,c) => {
						if(c && c.id === treeId){
							return c
						}else{
							return a
						}
					}, undefined)
					log.trace('approve:%d', treeImage.id)
					await this.approveTreeImage(treeImage.id)
					this.approvedTreeImage(treeImage.id)
					this.setApproveAllComplete(100 * ((i + 1) / total))
				}
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
			this.resetSelection();
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
			this.resetSelection()
			//clear all stuff
			await this.loadMoreTreeImages()
			//}}}
		},
		/*
		 * to select trees
		 * payload:
		 * 	{
		 * 		treeId		: string,
		 * 		isShift		: boolean,
		 * 		isCmd		: boolean,
		 * 		}
		 */
		clickTree(payload, state){
			//{{{
			const {treeId, isShift, isCmd}		= payload
			if(!isShift && !isCmd){
				this.set({
					treeImagesSelected		: [treeId],
					treeImageAnchor		: treeId,
				})
			}else if(isShift){
				log.debug(
					'press shift, and there is an anchor:', 
					state.verity.treeImageAnchor
				)
				//if no anchor, then, select from beginning
				let indexAnchor		= 0
				if(state.verity.treeImageAnchor !== undefined){
					indexAnchor		= state.verity.treeImages.reduce((a,c,i) => {
						if(c !== undefined && c.id === state.verity.treeImageAnchor){
							return i
						}else{
							return a
						}
					}, -1)
				}
				const indexCurrent		= state.verity.treeImages.reduce((a,c,i) => {
					if(c !== undefined && c.id === treeId){
						return i
					}else{
						return a
					}
				}, -1)
				const treeImagesSelected		= state.verity.treeImages.slice(
						Math.min(indexAnchor, indexCurrent),
						Math.max(indexAnchor, indexCurrent) + 1,
					).map(tree => tree.id)
				log.trace('find range:[%d,%d], selected:%d', 
					indexAnchor, 
					indexCurrent,
					treeImagesSelected.length,
				)
				this.set({
					treeImagesSelected,
				})
			}
			//}}}
		},
		selectAll(selected, state){
			//{{{
			this.set({
				treeImagesSelected		: selected ?
					state.verity.treeImages.map(tree => tree.id)
					:
					[],
				treeImageAnchor		: undefined,
			})
			//}}}
		},
	},
}

export default verity
