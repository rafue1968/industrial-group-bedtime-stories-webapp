"use client";

import Image from "next/image";
// import styles from "../styles/TopicCard.module.css" //"../styles/TopicCard.module.css";


export default function TopicCard({ title, imageUrl }){
    return (
        <div className="card">
            <div className="imageWrapper">
                <Image 
                    src={imageUrl}
                    alt={title}
                    layout="fill"
                    objectFit="cover"
                />
            </div>
            <h3 className="cardTitle">{title}</h3>
        </div>
    )
}