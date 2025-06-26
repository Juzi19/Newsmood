import { FetchData } from "./FetchButton";
import DeleteButton from "./DeleteButton";

export default async function SearchName({params}:{params:Promise<{name:string}>}){
    //extractng searchname from the dynamic route
    const {name} = await params;
    // workaround since uri component is 2x encoded
    const displayname = decodeURIComponent(decodeURIComponent(name));
    //note: double checking with user searches is unnecessary, since all user have permissions fetch news reports and sentiment data from the api 
    
    return(
        <div className="flex items-center justify-center w-full h-[90vh] flex-col">
            <h1 className="text-2xl">
                Newsanalyse
            </h1>
            <h2 className="text-gray-400">
                Suchbegriff: {displayname}
            </h2>
            <FetchData searchName={decodeURI(decodeURI(name))}></FetchData>
            <DeleteButton searchName={name}></DeleteButton>
        </div>
    )
}