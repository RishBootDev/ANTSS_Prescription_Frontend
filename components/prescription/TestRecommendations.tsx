import React from "react";
import { MappedTest } from "@/types/prescription";

interface TestRecommendationsProps {
  investigations?: MappedTest[];
  testsRequested?: MappedTest[];
}

const TestList = ({ title, tests }: { title: string; tests: MappedTest[] }) => (
  <section className="prescription-section mt-4">
    <h3 className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-900">
      {title}
    </h3>
    <ul className="space-y-1">
      {tests.map((test, index) => (
        <li
          key={test.id || index}
          className="flex items-start gap-1 text-[11px] font-semibold text-slate-800"
        >
          <span className="font-bold">*</span>
          <span>{test.name}</span>
          {test.notes && (
            <span className="font-normal italic text-slate-600">
              {" "}({test.notes})
            </span>
          )}
        </li>
      ))}
    </ul>
  </section>
);

export const TestRecommendations: React.FC<TestRecommendationsProps> = ({
  investigations = [],
  testsRequested = [],
}) => {
  if (investigations.length === 0 && testsRequested.length === 0) return null;

  return (
    <>
      {investigations.length > 0 && (
        <TestList title="Investigations / Results" tests={investigations} />
      )}
      {testsRequested.length > 0 && (
        <TestList title="Tests Requested" tests={testsRequested} />
      )}
    </>
  );
};
