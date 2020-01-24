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
		/*
		 * When approved a lot of trees, put them in this array, so could undo the
		 * approving action
		 * Note, the element of this array is tree object, not tree id
		 */
		treeImagesUndo		: [],
		/*
		 * When rejecting a lot of trees, set isBulkRejecting to true
		 * set it back to false when undo
		 */
		isBulkRejecting		: false,
		/*
		 * When approving a lot of trees, set isBulkApproving to true
		 * set it back to false when undo
		 */
		isBulkApproving		: false,
		isLoading		: false,
		isRejectAllProcessing		: false,
		isApproveAllProcessing		: false,
		//cal the complete of progress (0-100)
		rejectAllComplete		: 0,
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
		setIsBulkRejecting(state, isBulkRejecting){
			return {
				...state,
				isBulkRejecting,
			}

		},
		setIsBulkApproving(state, isBulkApproving){
			return {
				...state,
				isBulkApproving,
			}

		},
		setRejectAllProcessing(state, isRejectAllProcessing){
			return {
				...state,
				isRejectAllProcessing,
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
		setRejectAllComplete(state, rejectAllComplete){
			return {
				...state,
				rejectAllComplete,
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
		undoedTreeImage(state, treeId){
			/*
			 * put the tree back, from undo list, sort by id
			 */
			const treeUndo		= state.treeImagesUndo.reduce((a,c) => 
				(c.id === treeId ? c:a))
			const treeImagesUndo		= state.treeImagesUndo.filter(tree => 
				tree.id !== treeId)
			const treeImages		= [...state.treeImages, treeUndo].sort((a,b) => 
				(a.id - b.id)
			)
			return {
				...state,
				treeImages,
				treeImagesUndo,
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
		async undoTreeImage(id){
			await api.undoTreeImage(id)
			this.undoedTreeImage(id)
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
		 * reject all tree
		 */
		async rejectAll(payload, state){
			log.debug('rejectAll with state:', state)
			this.setLoading(true);
			this.setRejectAllProcessing(true);
			this.setIsBulkRejecting(true);
			const verityState		= state.verity;
			const total		= verityState.treeImagesSelected.length;
			const undo		= verityState.treeImages.filter(tree => 
				verityState.treeImagesSelected.some(id => id === tree.id)
			)
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
					log.trace('reject:%d', treeImage.id)
					await this.rejectTreeImage(treeImage.id)
					this.setRejectAllComplete(100 * ((i + 1) / total))
				}
			}catch(e){
				log.warn('get error:', e)
				this.setLoading(false);
				this.setRejectAllProcessing(false);
				return false
			}
			//push to undo list
			this.set({
				treeImagesUndo		: undo,
			})
			//finished, set status flags
			this.setLoading(false);
			this.setRejectAllProcessing(false);
			//reset
			this.setPagesLoaded(-1);
			this.setRejectAllComplete(0);
			this.resetSelection();
			return true;
		},

		/*
		 * approve all tree
		 */
		async approveAll(payload, state){
			//{{{
			log.debug('approveAll with state:', state)
			this.setLoading(true);
			this.setApproveAllProcessing(true);
			this.setIsBulkApproving(true);
			const verityState		= state.verity;
			const total		= verityState.treeImagesSelected.length;
			const undo		= verityState.treeImages.filter(tree => 
				verityState.treeImagesSelected.some(id => id === tree.id)
			)
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
					this.setApproveAllComplete(100 * ((i + 1) / total))
				}
			}catch(e){
				log.warn('get error:', e)
				this.setLoading(false);
				this.setApproveAllProcessing(false);
				return false
			}
			//push to undo list
			this.set({
				treeImagesUndo		: undo,
			})
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
		 * To undo all approved trees
		 */
		async undoAll(payload, state){
			//{{{
			log.debug('undo with state:', state)
			this.setLoading(true);
			this.setApproveAllProcessing(true);
			const verityState		= state.verity;
			const total		= verityState.treeImagesUndo.length;
			log.debug('items:%d', verityState.treeImages.length);
			try{
				for(let i = 0; i < verityState.treeImagesUndo.length; i++){
					const treeImage		= verityState.treeImagesUndo[i]
					log.trace('undo:%d', treeImage.id)
					await this.undoTreeImage(treeImage.id)
					this.setApproveAllComplete(100 * ((i + 1) / total))
				}
			}catch(e){
				log.warn('get error:', e)
				this.setLoading(false);
				this.setRejectAllProcessing(false);
				this.setApproveAllProcessing(false);
				return false
			}
			//finished, set status flags
			this.setLoading(false);
			this.setIsBulkApproving(false);
			this.setIsBulkRejecting(false);
			this.setApproveAllProcessing(false);
			this.setRejectAllProcessing(false);
			//reset
			this.setPagesLoaded(-1);
			this.setRejectAllComplete(0);
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
