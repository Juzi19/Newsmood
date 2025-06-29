type LoadingAnimationProps = {
  visible: boolean;
};

export default function LoadingAnimation(props:LoadingAnimationProps){
    const { visible } = props;
    return(
        <div className={`${visible?'flex':'hidden'} w-[100vw] h-[90dvh] bg-white absolute top-[10dvh] items-center justify-center z-20`}>
            <div className={`${visible?'flex':'hidden'} loading h-[80vw] w-[80vw] sm:h-[40vw] sm:w-[40vw] lg:h-[70dvh] lg:w-[70dvh]`}>
            {/* Loading Animation */}
            </div>
        </div>
        
    )
}