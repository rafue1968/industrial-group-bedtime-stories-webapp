"use client";


export default function Loading( {loading} ){

    if (!loading) return null;

    return(
        <div className="loading">Loading <span className="dots"></span></div>
    )
}