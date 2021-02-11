import React, {useState, useEffect} from 'react'
import CandidateImages from './CandidateImages'



function CandidateCapture(props) {

    return (
        <div >

           <CandidateImages
           imageList={props.imageList}
           deleteDataHandler={ props.deleteDataHandler}
           />


        </div>
    )
}

export default CandidateCapture;
