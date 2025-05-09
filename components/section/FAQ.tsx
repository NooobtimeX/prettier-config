import React from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Question } from "schema-dts";

interface FAQItem {
	question: string;
	answer: string;
}

const faqData: FAQItem[] = [
	{
		question: "What is the Prettier Config Generator?",
		answer:
			"The Prettier Config Generator is an online web application designed to help developers easily create and customize their .prettierrc configuration files. It provides a user-friendly interface to select various formatting options, ensuring consistent code style across projects.",
	},
	{
		question: "How do I use this generator?",
		answer:
			"Simply navigate through the various options presented on the page, such as print width, tab width, quote style, and more. As you select your preferences, the configuration file will be generated in real-time. Once satisfied, you can copy the generated configuration to your project.",
	},
	{
		question: "What formatting options can I configure?",
		answer:
			"You can configure a wide range of options including, but not limited to, experimental ternary and operator positions, print width, tab width, use of tabs vs. spaces, semicolon usage, single/double quotes, JSX quotes, trailing commas, bracket spacing, arrow function parentheses, and more.",
	},
	{
		question: "Does it support Prettier plugins?",
		answer:
			"Yes, the generator includes options to select and include official Prettier plugins, allowing you to extend Prettier's functionality for specific languages or frameworks.",
	},
	{
		question:
			"Is the generated configuration compatible with all Prettier versions?",
		answer:
			"The generator aims to produce configurations compatible with recent and widely used Prettier versions. However, it's always recommended to check the official Prettier documentation for any version-specific changes or deprecated options.",
	},
	{
		question: "How do I report a bug or suggest a feature?",
		answer:
			"For bug reports or feature suggestions, please refer to the contact or feedback section on the website, or check if there's a linked GitHub repository where you can submit an issue.",
	},
];

const SchemaOrgFAQ: React.FC<{ faqItems: FAQItem[] }> = ({ faqItems }) => {
	const faqPageSchema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqItems.map((item) => {
			const question: Question = {
				"@type": "Question",
				name: item.question,
				acceptedAnswer: {
					"@type": "Answer",
					text: item.answer,
				},
			};
			return question;
		}),
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
		/>
	);
};

const FAQSection: React.FC = () => {
	return (
		<section id="faq" className="mx-auto py-8">
			<h2 className="text-foreground mb-4 rounded-lg p-2 text-center text-3xl font-bold">
				Frequently Asked Questions{" "}
				<span role="img" aria-label="question mark">
					❓
				</span>
			</h2>
			<Accordion type="single" collapsible className="w-full">
				{faqData.map((item, index) => (
					<AccordionItem
						key={index}
						value={`item-${index}`}
						className="bg-card border-border mb-4 rounded-lg border shadow-md"
					>
						<AccordionTrigger className="text-card-foreground hover:bg-muted flex w-full items-center justify-between rounded-t-lg p-4 text-left text-lg font-semibold transition-colors duration-200">
							{item.question}
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground border-border rounded-b-lg border-t p-4">
							{item.answer}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
			<SchemaOrgFAQ faqItems={faqData} />
		</section>
	);
};

export default FAQSection;
