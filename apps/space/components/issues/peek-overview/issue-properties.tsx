// headless ui
import { Disclosure } from "@headlessui/react";
// import { getStateGroupIcon } from "components/icons";
// hooks
import useToast from "hooks/use-toast";
// icons
import { Icon } from "components/ui";
import { copyTextToClipboard, addSpaceIfCamelCase } from "helpers/string.helper";
// types
import { IIssue } from "types/issue";
// constants
import { issueGroupFilter, issuePriorityFilter } from "constants/data";
import { useEffect } from "react";
import { renderDateFormat } from "constants/helpers";
import { IPeekMode } from "store/issue_details";
import { useRouter } from "next/router";
import { RootStore } from "store/root";
import { useMobxStore } from "lib/mobx/store-provider";

type Props = {
  issueDetails: IIssue;
  mode?: IPeekMode;
};

const validDate = (date: any, state: string): string => {
  if (date === null || ["backlog", "unstarted", "cancelled"].includes(state))
    return `bg-gray-500/10 text-gray-500 border-gray-500/50`;
  else {
    const today = new Date();
    const dueDate = new Date(date);

    if (dueDate < today) return `bg-red-500/10 text-red-500 border-red-500/50`;
    else return `bg-green-500/10 text-green-500 border-green-500/50`;
  }
};

export const PeekOverviewIssueProperties: React.FC<Props> = ({ issueDetails, mode }) => {
  const { setToastAlert } = useToast();

  const { issueDetails: issueDetailStore }: RootStore = useMobxStore();

  const router = useRouter();
  const { workspaceSlug } = router.query;

  const startDate = issueDetails.start_date;
  const targetDate = issueDetails.target_date;

  const minDate = startDate ? new Date(startDate) : null;
  minDate?.setDate(minDate.getDate());

  const maxDate = targetDate ? new Date(targetDate) : null;
  maxDate?.setDate(maxDate.getDate());

  const state = issueDetails.state_detail;
  const stateGroup = issueGroupFilter(state.group);

  const priority = issueDetails.priority ? issuePriorityFilter(issueDetails.priority) : null;

  const handleCopyLink = () => {
    const originURL = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";

    copyTextToClipboard(
      `${originURL}/${workspaceSlug}/projects/${issueDetails.project}/issues/${issueDetails.id}`
    ).then(() => {
      setToastAlert({
        type: "success",
        title: "Link copied!",
        message: "Issue link copied to clipboard",
      });
    });
  };

  return (
    <div className={mode === "full" ? "divide-y divide-custom-border-200" : ""}>
      {mode === "full" && (
        <div className="flex justify-between gap-2 pb-3">
          <h6 className="flex items-center gap-2 font-medium">
            {/* {getStateGroupIcon(issue.state_detail.group, "16", "16", issue.state_detail.color)} */}
            {issueDetails.project_detail.identifier}-{issueDetails.sequence_id}
          </h6>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleCopyLink} className="-rotate-45">
              <Icon iconName="link" />
            </button>
          </div>
        </div>
      )}
      <div className={`space-y-4 ${mode === "full" ? "pt-3" : ""}`}>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex-shrink-0 w-1/4 flex items-center gap-2 font-medium">
            <Icon iconName="radio_button_checked" className="!text-base flex-shrink-0" />
            <span className="flex-grow truncate">State</span>
          </div>
          <div className="w-3/4">
            {stateGroup && (
              <div className="inline-flex bg-custom-background-80 text-sm rounded px-2.5 py-0.5">
                <div className="flex items-center gap-1.5 text-left text-custom-text-100">
                  <stateGroup.icon />
                  {addSpaceIfCamelCase(state?.name ?? "")}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="flex-shrink-0 w-1/4 flex items-center gap-2 font-medium">
            <Icon iconName="signal_cellular_alt" className="!text-base flex-shrink-0" />
            <span className="flex-grow truncate">Priority</span>
          </div>
          <div className="w-3/4">
            <div
              className={`inline-flex items-center gap-1.5 text-left text-sm capitalize rounded px-2.5 py-0.5 ${
                priority?.key === "urgent"
                  ? "border-red-500/20 bg-red-500/20 text-red-500"
                  : priority?.key === "high"
                  ? "border-orange-500/20 bg-orange-500/20 text-orange-500"
                  : priority?.key === "medium"
                  ? "border-yellow-500/20 bg-yellow-500/20 text-yellow-500"
                  : priority?.key === "low"
                  ? "border-green-500/20 bg-green-500/20 text-green-500"
                  : "bg-custom-background-80 border-custom-border-200"
              }`}
            >
              {priority && (
                <span className="grid place-items-center -my-1">
                  <Icon iconName={priority?.icon!} />
                </span>
              )}
              <span>{priority?.title ?? "None"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex-shrink-0 w-1/4 flex items-center gap-2 font-medium">
            <Icon iconName="calendar_today" className="!text-base flex-shrink-0" />
            <span className="flex-grow truncate">Due date</span>
          </div>
          <div>
            {issueDetails.target_date ? (
              <div
                className={`h-[24px] rounded-md flex px-2.5 py-1 items-center border border-custom-border-100 gap-1 text-custom-text-100 text-xs font-medium 
                ${validDate(issueDetails.target_date, state)}`}
              >
                {renderDateFormat(issueDetails.target_date)}
              </div>
            ) : (
              <span className="text-custom-text-200">Empty</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
