import React from 'react';
import { Check } from 'lucide-react';

interface TimelineStep {
	id: number;
	title: string;
	description?: string;
}

interface TimelineProps {
	steps: TimelineStep[];
	currentStep: number;
	completedSteps: number[];
}

const Timeline: React.FC<TimelineProps> = ({ steps, currentStep, completedSteps }) => {
	return (
		<div className="bg-white shadow-sm mb-6 p-4 border border-secondary rounded-lg w-full">
			<div className="flex justify-between items-center">
				{steps.map((step, index) => {
					const isCompleted = completedSteps.includes(step.id);
					const isCurrent = currentStep === step.id;
					const isLast = index === steps.length - 1;

					return (
						<div key={step.id} className="flex flex-1 items-center">
							{/* Step Circle */}
							<div className="flex flex-col items-center">
								<div
									className={`
										w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200
										${isCompleted 
											? 'bg-green-500 border-green-500 text-white' 
											: isCurrent 
												? 'bg-blue-500 border-blue-500 text-white' 
												: 'bg-gray-100 border-gray-300 text-gray-500'
										}
									`}
								>
									{isCompleted ? (
										<Check size={20} />
									) : (
										<span className="font-semibold text-sm">{step.id}</span>
									)}
								</div>
								
								{/* Step Title */}
								<div className="mt-2 text-center">
									<p
										className={`
											text-sm font-medium
											${isCompleted || isCurrent 
												? 'text-gray-900' 
												: 'text-gray-500'
											}
										`}
									>
										{step.title}
									</p>
									{step.description && (
										<p className="mt-1 text-gray-400 text-xs">
											{step.description}
										</p>
									)}
								</div>
							</div>

							{/* Connector Line */}
							{!isLast && (
								<div
									className={`
										flex-1 h-0.5 mx-4 transition-all duration-200
										${isCompleted 
											? 'bg-green-500' 
											: 'bg-gray-300'
										}
									`}
								/>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Timeline;