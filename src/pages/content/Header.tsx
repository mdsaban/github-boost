const Header = ({ closePanel }) => {
  return (
    <>
      <div className='flex justify-between items-center'>
        <div className='text-lg font-semibold'>Github boost </div>
        <div>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='32'
            height='32'
            fill='#f2f2f2'
            viewBox='0 0 256 256'
            className='opacity-50 cursor-pointer p-2'
            onClick={closePanel}
          >
            <path d='M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z'></path>
          </svg>
        </div>
      </div>
      <div className='text-sm font-normal text-gray-500 mb-4 pr-6'>
        Boost your github DX to review PRs, for any questions or help please raise issue here
      </div>
    </>
  )
}

export default Header
