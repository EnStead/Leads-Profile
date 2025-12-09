
import FileState from '../assets/FileState.png';

const EmptyState = ({ 
  title = "You have no leads yet!",
  description = "Once a lead begins processing, you'll automatically receive the details here, and you can easily export them.",
  Image = FileState
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4">
      {/* Icon/Illustration */}
      <div className="relative mb-6">
        {/* Stacked sheets illustration */}
        <img src={Image} alt="" className='w-40' />
      </div>

      {/* Text Content */}
      <h2 className="text-2xl font-park font-bold text-gray-900 mb-3 text-center">
        {title}
      </h2>
      <p className="text-gray-600 text-center max-w-md leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default EmptyState

