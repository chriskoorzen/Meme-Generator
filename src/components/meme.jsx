import { useState, useEffect, useRef } from 'react'
import domtoimage from 'dom-to-image'
import MemeText from './memeText.jsx'


export default function Meme() {
    const [imageIndex, setImageIndex] = useState(0)             // The default image index number
    const [memeData, setMemeData] = useState([{url:""}])        // The most basic object expected by <img src>
    const [textData, setTextData] = useState([])                // Meme texts
    const memeBox = useRef(null)                                // MemeImage wrapper div (DOM Element)
    const [textSize, settextSize] = useState("text-xl")         // Meme Text size
    const memeImages = useRef(null)                             // Dialog containing meme images

    useEffect(() => {                                           // Retrieve meme data from remote source
        fetch("https://api.imgflip.com/get_memes")
            .then(res => res.json())
            .then(data => {
                setMemeData(data.data.memes)
            })
    }, [])                                                      // Init only once


    function getNewImage(){
        let randomImage = imageIndex                            // Set to current image index

        while (randomImage === imageIndex){                     // Make sure random does not return the same image index
            randomImage = Math.floor(Math.random() * memeData.length)
        }

        setImageIndex(randomImage)                              // Set to new image (trigger re-render)
    }

    function setSelectedImage(index){                           // Allow user to set selected image
        setImageIndex(index)
    }

    function readUserInputText(event){
        if(event.key === "Enter"){
            const memeText = event.target.value         // Get independent reference
            setTextData(data => [...data, memeText])    // Update
            event.target.value = ""                     // Reset input
        }
    }

    function deleteMemeText(text){
        const newTextData =  textData.filter(memeText => !(memeText===text))    // Filter out this text
        setTextData(newTextData)                                                // Update
    }

    function getBoundary(){
        const box = memeBox.current.getBoundingClientRect()     // Method to pass boundary prop to children
        return {
            x: box.width,
            y: box.height
        }
    }

    function saveImage(){
        domtoimage.toJpeg(memeBox.current, { quality: 0.95 })   // Use domtoimage lib to create image from DOM node
        .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'my-new-meme.jpeg';
            link.href = dataUrl;
            link.click();                                       // Auto download
        })
    }

    function handleTextSizeChange(event){
        settextSize(event.target.value)
    }

    return (
        <main className="w-4/5 mx-auto">
            <div className="grid grid-rows-3 gap-4 items-center">
                
                <div className="w-full flex flex-col mt-5">
                    <label for="memetext" className="px-2">Enter your text pieces here:</label>
                    <input
                        id="memetext"
                        type="text"
                        placeholder="Meme Text"
                        className="p-2 rounded-lg border-2 block w-full"

                        onKeyUp={readUserInputText}
                    />
                </div>

                <div className="flex flex-row justify-between items-center w-full">
                    <fieldset className="grid grid-cols-4 gap-x-2 rounded-lg border-2 border-gray-300 p-2">
                        <legend>Text Size</legend>
                        <label>
                            <input onChange={handleTextSizeChange} name="text-size" type="radio" value="text-xs" checked={textSize==="text-xs"}/>
                            Tiny
                        </label>
                        <label>
                            <input onChange={handleTextSizeChange} name="text-size" type="radio" value="text-base" checked={textSize==="text-base"}/>
                            Small
                        </label>
                        <label>
                            <input onChange={handleTextSizeChange} name="text-size" type="radio" value="text-xl" checked={textSize==="text-xl"}/>
                            Regular
                        </label>
                        <label>
                            <input onChange={handleTextSizeChange} name="text-size" type="radio" value="text-3xl" checked={textSize==="text-3xl"}/>
                            Large
                        </label>
                        <label>
                            <input onChange={handleTextSizeChange} name="text-size" type="radio" value="text-5xl" checked={textSize==="text-5xl"}/>
                            Big
                        </label>
                        <label>
                            <input onChange={handleTextSizeChange} name="text-size" type="radio" value="text-7xl" checked={textSize==="text-7xl"}/>
                            Huge
                        </label>
                        <label>
                            <input onChange={handleTextSizeChange} name="text-size" type="radio" value="text-9xl" checked={textSize==="text-9xl"}/>
                            Giant
                        </label>
                        
                    </fieldset>
                    
                    <button
                        className="h-fit p-2 rounded-lg bg-green-700 text-white font-bold active:border-2 border-black active:shadow-lg"
                        onClick={saveImage}
                    >
                        Save Meme
                    </button>
                </div>

                <div className="flex flex-row w-full gap-5">
                    <dialog
                        ref={memeImages}
                        onClick={()=>{memeImages.current.close()}}
                        className="size-4/5 rounded-xl p-4 bg-gray-500 backdrop:bg-black/80"
                    >
                        <div className="flex flex-row flex-wrap gap-3">
                            {memeData.map((image, index)=>{

                                return (
                                    <div key={image.id} className="size-48 p-2 bg-slate-300 rounded">
                                        <img
                                            className="object-contain size-full"
                                            src={image.url}
                                            alt={image.name}
                                            onClick={()=>{setSelectedImage(index)}}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </dialog>
                    <button
                        className="grow app-gradient p-4 rounded-lg text-white font-bold active:ring-2 active:shadow-lg"
                        onClick={()=>{memeImages.current.showModal()}}
                    >
                        Select a Meme Image
                    </button>
                    <button
                        className="grow app-gradient p-4 rounded-lg text-white font-bold active:ring-2 active:shadow-lg"
                        onClick={getNewImage}
                    >
                        Get a random meme image 🖼
                    </button>
                </div>
            </div>

            <div className="w-full bg-gray-200 rounded">
                <div
                    className="relative w-fit h-fit mx-auto"
                    ref={memeBox}
                >
                    <img 
                        className="object-contain border-2 mx-auto"
                        key={imageIndex} 
                        src={memeData[imageIndex].url}
                    />

                    {textData.map(
                        memeText => {
                            return (
                                <MemeText 
                                    key={memeText}
                                    text={memeText}
                                    textSize={textSize}
                                    deleteFunction={deleteMemeText}
                                    getBoundary={getBoundary}
                                />
                            )
                        }
                    )}
                </div>
            </div>
        </main>
    )
}