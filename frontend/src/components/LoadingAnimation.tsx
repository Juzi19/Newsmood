type LoadingAnimationProps = {
  visible: boolean;
};

export default function LoadingAnimation(props:LoadingAnimationProps){
    const { visible } = props;
    return(
        <div className={`${visible?'flex':'hidden'} w-[100vw] h-[88vh] bg-white absolute top-[12vh] items-center justify-center`}>
            <div className={`${visible?'flex':'hidden'} loading h-[80vw] w-[80vw] sm:h-[40vw] sm:w-[40vw] lg:h-[70vh] lg:w-[70vh]`}>
            {/* Loading Animation */}
            </div>
        </div>
        
    )
}