// Portions adapted from HeroUI v3.2.7 (Apache-2.0); modified for SY INC.
// Copyright 2025 NextUI Inc.
import type {Meta, StoryObj} from "@storybook/react";
import type {Selection, SortDescriptor} from "react-aria-components/Table";

import {Icon} from "@iconify/react";
import {cn} from "@sy-inc/styles";
import React from "react";
import {useDragAndDrop, useListData} from "react-aria-components";

import {Avatar} from "../avatar";
import {Button} from "../button";
import {Checkbox} from "../checkbox";
import {Chip} from "../chip";
import {EmptyState} from "../empty-state";
import {Pagination} from "../pagination";
import {Spinner} from "../spinner";

import {Table} from "./index";

export default {
  component: Table,
  parameters: {
    layout: "centered",
  },
  title: "Components/Table",
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary"],
    },
  },
} as Meta<typeof Table>;

type Story = StoryObj<typeof Table>;

/* -------------------------------------------------------------------------------------------------
 * Sample Data
 * -----------------------------------------------------------------------------------------------*/
interface User {
  id: number;
  name: string;
  image_url: string;
  role: string;
  status: "Active" | "Inactive" | "On Leave";
  email: string;
}

const users: User[] = [
  {
    email: "kate@acme.com",
    image_url: "https://assets.sy-inc.com/avatars/red.jpg",
    id: 4586932,
    name: "Kate Moore",
    role: "Chief Executive Officer",
    status: "Active",
  },
  {
    email: "john@acme.com",
    image_url: "https://assets.sy-inc.com/avatars/green.jpg",
    id: 5273849,
    name: "John Smith",
    role: "Chief Technology Officer",
    status: "Active",
  },
  {
    email: "sara@acme.com",
    image_url: "https://assets.sy-inc.com/avatars/blue.jpg",
    id: 7492836,
    name: "Sara Johnson",
    role: "Chief Marketing Officer",
    status: "On Leave",
  },
  {
    email: "michael@acme.com",
    image_url: "https://assets.sy-inc.com/avatars/purple.jpg",
    id: 8293746,
    name: "Michael Brown",
    role: "Chief Financial Officer",
    status: "Active",
  },
  {
    email: "emily@acme.com",
    image_url: "https://assets.sy-inc.com/avatars/orange.jpg",
    id: 1234567,
    name: "Emily Davis",
    role: "Product Manager",
    status: "Inactive",
  },
  {
    email: "davis@acme.com",
    image_url: "https://assets.sy-inc.com/avatars/black.jpg",
    id: 9876543,
    name: "Davis Wilson",
    role: "Lead Designer",
    status: "Active",
  },
  {
    email: "olivia@acme.com",
    image_url: "https://assets.sy-inc.com/avatars/red.jpg",
    id: 3456789,
    name: "Olivia Martinez",
    role: "Frontend Engineer",
    status: "Active",
  },
  {
    email: "james@acme.com",
    image_url: "https://assets.sy-inc.com/avatars/green.jpg",
    id: 4567890,
    name: "James Taylor",
    role: "Backend Engineer",
    status: "Active",
  },
  {
    email: "sophia@acme.com",
    image_url: "https://assets.sy-inc.com/avatars/blue.jpg",
    id: 5678901,
    name: "Sophia Anderson",
    role: "QA Engineer",
    status: "On Leave",
  },
  {
    email: "liam@acme.com",
    image_url: "https://assets.sy-inc.com/avatars/purple.jpg",
    id: 6789012,
    name: "Liam Thomas",
    role: "DevOps Engineer",
    status: "Active",
  },
  {
    email: "ava@acme.com",
    image_url: "https://assets.sy-inc.com/avatars/orange.jpg",
    id: 7890123,
    name: "Ava Jackson",
    role: "Data Analyst",
    status: "Inactive",
  },
  {
    email: "noah@acme.com",
    image_url: "https://assets.sy-inc.com/avatars/black.jpg",
    id: 8901234,
    name: "Noah White",
    role: "Security Engineer",
    status: "Active",
  },
];

const columns = [
  {id: "name", isRowHeader: true, name: "Name"},
  {id: "role", name: "Role"},
  {id: "status", name: "Status"},
  {id: "email", name: "Email"},
];

/* -------------------------------------------------------------------------------------------------
 * Wrapper
 * -----------------------------------------------------------------------------------------------*/
const Wrapper = ({children}: {children: React.ReactNode}) => (
  <div className="w-full max-w-4xl">{children}</div>
);

/* -------------------------------------------------------------------------------------------------
 * Pagination Helpers
 * -----------------------------------------------------------------------------------------------*/
const ROWS_PER_PAGE = 4;

function usePagination<T>(items: T[], rowsPerPage = ROWS_PER_PAGE) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.ceil(items.length / rowsPerPage);

  const paginatedItems = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return items.slice(start, start + rowsPerPage);
  }, [items, page, rowsPerPage]);

  const start = (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, items.length);

  return {end, page, paginatedItems, setPage, start, total: items.length, totalPages};
}

function TablePaginationFooter({pagination}: {pagination: ReturnType<typeof usePagination>}) {
  const {end, page, setPage, start, total, totalPages} = pagination;
  const pages = Array.from({length: totalPages}, (_, i) => i + 1);

  return (
    <Pagination size="sm">
      <Pagination.Summary>
        {start} to {end} of {total} results
      </Pagination.Summary>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous
            isDisabled={page === 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          >
            <Pagination.PreviousIcon />
            Prev
          </Pagination.Previous>
        </Pagination.Item>
        {pages.map((p) => (
          <Pagination.Item key={p}>
            <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
              {p}
            </Pagination.Link>
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Next
            isDisabled={page === totalPages}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Stories
 * -----------------------------------------------------------------------------------------------*/

const statusColorMap: Record<string, "success" | "danger" | "warning"> = {
  Active: "success",
  Inactive: "danger",
  "On Leave": "warning",
};

/**
 * Shared template for Default and SecondaryVariant stories.
 */
function DefaultTableTemplate({variant = "primary"}: {variant?: "primary" | "secondary"}) {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor | undefined>({
    column: "name",
    direction: "ascending",
  });

  const sortedUsers = React.useMemo(() => {
    if (!sortDescriptor) return users;

    return [...users].sort((a, b) => {
      const col = sortDescriptor.column as keyof User;
      const first = String(a[col]);
      const second = String(b[col]);
      let cmp = first.localeCompare(second);

      if (sortDescriptor.direction === "descending") {
        cmp *= -1;
      }

      return cmp;
    });
  }, [sortDescriptor]);

  const pagination = usePagination(sortedUsers);

  return (
    <Wrapper>
      <Table variant={variant}>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Custom cells"
            className="min-w-[800px]"
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            sortDescriptor={sortDescriptor}
            onSelectionChange={setSelectedKeys}
            onSortChange={setSortDescriptor}
          >
            <Table.Header>
              <Table.Column className="pe-2">
                <Checkbox aria-label="Select all" slot="selection">
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                  </Checkbox.Content>
                </Checkbox>
              </Table.Column>
              <Table.Column allowsSorting isRowHeader className="after:hidden" id="id">
                {({sortDirection}) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    Worker ID
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
              <Table.Column allowsSorting id="name">
                {({sortDirection}) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    Member
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
              <Table.Column allowsSorting id="role">
                {({sortDirection}) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    Role
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
              <Table.Column allowsSorting id="status">
                {({sortDirection}) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    Status
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
              <Table.Column className="text-end">Actions</Table.Column>
            </Table.Header>
            <Table.Body>
              {pagination.paginatedItems.map((user) => (
                <Table.Row key={user.id} id={user.id}>
                  <Table.Cell className="pe-2">
                    <Checkbox
                      aria-label={`Select ${user.name}`}
                      slot="selection"
                      variant="secondary"
                    >
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                      </Checkbox.Content>
                    </Checkbox>
                  </Table.Cell>
                  <Table.Cell className="font-medium">
                    <div className="flex items-center gap-2">
                      #{user.id.toString()}{" "}
                      <Button isIconOnly aria-label="Copy user ID" size="sm" variant="ghost">
                        <Icon className="size-4 text-muted" icon="gravity-ui:copy" />
                      </Button>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <Avatar.Image alt="" src={user.image_url} />
                        <Avatar.Fallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Avatar.Fallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-xs">{user.name}</span>
                        <span className="text-xs text-muted">{user.email}</span>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="min-w-52">{user.role}</Table.Cell>
                  <Table.Cell className="min-w-25">
                    <Chip color={statusColorMap[user.status]} size="sm" variant="soft">
                      {user.status}
                    </Chip>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      <Button isIconOnly aria-label="View details" size="sm" variant="tertiary">
                        <Icon className="size-4" icon="gravity-ui:eye" />
                      </Button>
                      <Button isIconOnly aria-label="Edit" size="sm" variant="tertiary">
                        <Icon className="size-4" icon="gravity-ui:pencil" />
                      </Button>
                      <Button isIconOnly aria-label="Delete" size="sm" variant="danger-soft">
                        <Icon className="size-4" icon="gravity-ui:trash-bin" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        <Table.Footer>
          <TablePaginationFooter pagination={pagination} />
        </Table.Footer>
      </Table>
    </Wrapper>
  );
}

/**
 * Default table with custom cells: avatars, chips, action buttons, and sortable columns.
 */
export const Default: Story = {
  args: {
    variant: "primary",
  },
  render: ({variant}) => <DefaultTableTemplate variant={variant} />,
};

/**
 * Secondary variant: same content as Default with secondary styling.
 */
export const SecondaryVariant: Story = {
  render: () => <DefaultTableTemplate variant="secondary" />,
};

/**
 * Empty state via user-provided renderEmptyState.
 */
export const EmptyStateDemo: Story = {
  args: {
    variant: "primary",
  },
  render: ({variant}) => (
    <Wrapper>
      <Table className="min-h-[200px] min-w-[600px]" variant={variant}>
        <Table.ScrollContainer>
          <Table.Content aria-label="Empty state" className="h-full">
            <Table.Header>
              {columns.map((col) => (
                <Table.Column key={col.id} id={col.id} isRowHeader={col.isRowHeader}>
                  {col.name}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body
              renderEmptyState={() => (
                <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                  <Icon className="size-6 text-muted" icon="gravity-ui:tray" />
                  <span className="text-sm text-muted">No results found</span>
                </EmptyState>
              )}
            >
              {[]}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </Wrapper>
  ),
};

/**
 * Dynamic collection with items prop.
 * Uses Table.Collection to render dynamic cells within rows,
 * which also allows placing static cells (e.g. checkbox) before the dynamic ones.
 */
export const DynamicCollection: Story = {
  render: () => {
    const pagination = usePagination(users);

    return (
      <Wrapper>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Dynamic collection" className="min-w-[600px]">
              <Table.Header columns={columns}>
                {(column) => (
                  <Table.Column isRowHeader={column.isRowHeader}>{column.name}</Table.Column>
                )}
              </Table.Header>
              <Table.Body items={pagination.paginatedItems}>
                {(user) => (
                  <Table.Row>
                    <Table.Collection items={columns}>
                      {(column) => <Table.Cell>{user[column.id as keyof User]}</Table.Cell>}
                    </Table.Collection>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
          <Table.Footer>
            <TablePaginationFooter pagination={pagination} />
          </Table.Footer>
        </Table>
      </Wrapper>
    );
  },
};

/**
 * Dynamic collection with selection — shows how Table.Collection lets you
 * add static cells (checkbox) alongside dynamic column-based cells.
 */
const DynamicWithSelectionTemplate = () => {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());
  const pagination = usePagination(users);

  return (
    <Wrapper>
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Dynamic with selection"
            className="min-w-[650px]"
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            onSelectionChange={setSelectedKeys}
          >
            <Table.Header>
              <Table.Column>
                <Table.SelectionCheckbox aria-label="Select all" />
              </Table.Column>
              <Table.Collection items={columns}>
                {(column) => (
                  <Table.Column isRowHeader={column.isRowHeader}>{column.name}</Table.Column>
                )}
              </Table.Collection>
            </Table.Header>
            <Table.Body items={pagination.paginatedItems}>
              {(user) => (
                <Table.Row>
                  <Table.Cell>
                    <Table.SelectionCheckbox
                      aria-label={`Select ${user.name}`}
                      variant="secondary"
                    />
                  </Table.Cell>
                  <Table.Collection items={columns}>
                    {(column) => <Table.Cell>{user[column.id]}</Table.Cell>}
                  </Table.Collection>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        <Table.Footer>
          <TablePaginationFooter pagination={pagination} />
        </Table.Footer>
      </Table>
    </Wrapper>
  );
};

export const DynamicWithSelection: Story = {
  render: () => <DynamicWithSelectionTemplate />,
};

/**
 * Drag to reorder — `Table.DragHandle` in a leading cell; the drop line comes from the
 * default React Aria indicator, so no `renderDropIndicator` is needed.
 */
const ReorderTemplate = ({variant = "primary"}: {variant?: "primary" | "secondary"}) => {
  const list = useListData({initialItems: users.slice(0, 5)});
  const {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({"text/plain": String(key)})),
    onReorder(event) {
      if (event.target.dropPosition === "before") {
        list.moveBefore(event.target.key, event.keys);
      } else if (event.target.dropPosition === "after") {
        list.moveAfter(event.target.key, event.keys);
      }
    },
  });

  return (
    <Wrapper>
      <Table variant={variant}>
        <Table.ScrollContainer>
          <Table.Content
            aria-label={`Reorderable users (${variant})`}
            className="min-w-[650px]"
            dragAndDropHooks={dragAndDropHooks}
          >
            <Table.Header>
              <Table.Column>
                <span className="sr-only">Reorder</span>
              </Table.Column>
              <Table.Collection items={columns}>
                {(column) => (
                  <Table.Column isRowHeader={column.isRowHeader}>{column.name}</Table.Column>
                )}
              </Table.Collection>
            </Table.Header>
            <Table.Body items={list.items}>
              {(user) => (
                <Table.Row>
                  <Table.Cell>
                    <Table.DragHandle />
                  </Table.Cell>
                  <Table.Collection items={columns}>
                    {(column) => <Table.Cell>{user[column.id as keyof User]}</Table.Cell>}
                  </Table.Collection>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </Wrapper>
  );
};

export const Reorder: Story = {
  render: () => (
    <div className="flex w-[896px] flex-col gap-8">
      <ReorderTemplate />
      <ReorderTemplate variant="secondary" />
    </div>
  ),
};

export const SelectionCheckboxes: Story = {
  render: () => (
    <Wrapper>
      <Table>
        <Table.Content aria-label="Team selection" selectionMode="multiple">
          <Table.Header>
            <Table.Column aria-label="Select rows">
              <Table.SelectionCheckbox aria-label="Select all rows" />
            </Table.Column>
            <Table.Column isRowHeader>Name</Table.Column>
            <Table.Column>Role</Table.Column>
          </Table.Header>
          <Table.Body items={users.slice(0, 3)}>
            {(user) => (
              <Table.Row>
                <Table.Cell>
                  <Table.SelectionCheckbox aria-label={`Select ${user.name}`} variant="secondary" />
                </Table.Cell>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{user.role}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table>
    </Wrapper>
  ),
};

interface ShowcaseRow {
  id: number;
  employee: string;
  department: string;
  project: string;
  location: string;
  status: "Active" | "On Leave" | "At Risk";
  email: string;
  updated: string;
  notes: string;
}

const showcaseRows: ShowcaseRow[] = [
  [
    "Amelia Hart",
    "Platform Engineering",
    "Customer identity migration",
    "Kuala Lumpur, Malaysia",
    "Active",
    "amelia.hart@northstar.example",
    "2026-08-27",
    "Coordinating the final validation window with regional support teams and security reviewers.",
  ],
  [
    "Ravi Menon",
    "Data & Insights",
    "Quarterly revenue intelligence",
    "Singapore",
    "Active",
    "ravi.menon@northstar.example",
    "2026-08-26",
    "Preparing a consolidated briefing that reconciles finance, sales, and customer success data.",
  ],
  [
    "Sofia Laurent",
    "Customer Experience",
    "Enterprise onboarding redesign",
    "Paris, France",
    "On Leave",
    "sofia.laurent@northstar.example",
    "2026-08-25",
    "Handover is complete; the research synthesis and accessibility review are ready for sign-off.",
  ],
  [
    "Daniel Brooks",
    "Security Operations",
    "Privileged access review",
    "London, United Kingdom",
    "At Risk",
    "daniel.brooks@northstar.example",
    "2026-08-24",
    "Several application owners have not yet confirmed their remediation dates for legacy accounts.",
  ],
  [
    "Mei Tanaka",
    "Product Strategy",
    "International pricing framework",
    "Tokyo, Japan",
    "Active",
    "mei.tanaka@northstar.example",
    "2026-08-23",
    "Comparing regional elasticity findings before the leadership workshop scheduled for next week.",
  ],
  [
    "Lucas Ferreira",
    "Developer Experience",
    "Unified release workflow",
    "São Paulo, Brazil",
    "Active",
    "lucas.ferreira@northstar.example",
    "2026-08-22",
    "The pilot repository has migrated successfully and the remaining teams are queued for enablement.",
  ],
  [
    "Nora Williams",
    "People Operations",
    "Manager capability programme",
    "Toronto, Canada",
    "Active",
    "nora.williams@northstar.example",
    "2026-08-21",
    "Collecting feedback from the first cohort and adjusting the coaching materials for remote managers.",
  ],
  [
    "Omar Haddad",
    "Infrastructure",
    "Multi-region observability rollout",
    "Dubai, United Arab Emirates",
    "At Risk",
    "omar.haddad@northstar.example",
    "2026-08-20",
    "The final data residency decision is blocking two production dashboards and their alert policies.",
  ],
  [
    "Grace Chen",
    "Brand Marketing",
    "Annual customer conference",
    "San Francisco, United States",
    "Active",
    "grace.chen@northstar.example",
    "2026-08-19",
    "Speaker confirmations are nearly complete, with partner announcements still awaiting legal approval.",
  ],
  [
    "Ethan Murphy",
    "Commercial Operations",
    "Renewal forecasting improvements",
    "Dublin, Ireland",
    "Active",
    "ethan.murphy@northstar.example",
    "2026-08-18",
    "Testing a revised forecast model against historical expansions, contractions, and delayed renewals.",
  ],
  [
    "Priya Shah",
    "Legal & Compliance",
    "Regional data processing review",
    "Bengaluru, India",
    "On Leave",
    "priya.shah@northstar.example",
    "2026-08-17",
    "The assigned deputy is reviewing the vendor amendments and will return comments by Friday.",
  ],
  [
    "Jonas Weber",
    "Finance",
    "Operating plan reconciliation",
    "Berlin, Germany",
    "Active",
    "jonas.weber@northstar.example",
    "2026-08-16",
    "Reconciling headcount assumptions and cloud infrastructure allocations across the operating plan.",
  ],
  [
    "Isabella Rossi",
    "Research & Design",
    "Self-service workflow study",
    "Milan, Italy",
    "Active",
    "isabella.rossi@northstar.example",
    "2026-08-15",
    "The moderated sessions revealed a clear opportunity to simplify first-run configuration for new teams.",
  ],
  [
    "Noah Campbell",
    "Sales Engineering",
    "Strategic account architecture",
    "Melbourne, Australia",
    "At Risk",
    "noah.campbell@northstar.example",
    "2026-08-14",
    "The customer is waiting for a confirmed integration timeline before approving the technical proposal.",
  ],
  [
    "Yuki Sato",
    "Quality Engineering",
    "Cross-browser regression programme",
    "Osaka, Japan",
    "Active",
    "yuki.sato@northstar.example",
    "2026-08-13",
    "Automated coverage now includes the highest-volume workflows and the latest mobile browser releases.",
  ],
  [
    "Maya Johnson",
    "Partnerships",
    "Cloud marketplace launch",
    "New York, United States",
    "Active",
    "maya.johnson@northstar.example",
    "2026-08-12",
    "Partner enablement assets are published while commercial terms move through the final approval round.",
  ],
  [
    "Alexander Petrov",
    "Technical Support",
    "Priority incident response playbook",
    "Prague, Czech Republic",
    "On Leave",
    "alexander.petrov@northstar.example",
    "2026-08-11",
    "The support rotation has adopted the draft playbook and is recording follow-up improvements.",
  ],
  [
    "Chloe Martin",
    "Analytics Engineering",
    "Executive metrics workspace",
    "Montreal, Canada",
    "Active",
    "chloe.martin@northstar.example",
    "2026-08-10",
    "Dashboard definitions are being standardized so leadership reports use the same source-of-truth metrics.",
  ],
  [
    "Samuel Okafor",
    "Product Operations",
    "Launch readiness programme",
    "Lagos, Nigeria",
    "At Risk",
    "samuel.okafor@northstar.example",
    "2026-08-09",
    "Two dependent teams still need to confirm ownership for localization testing and customer communications.",
  ],
  [
    "Hannah Lee",
    "Learning & Development",
    "Internal technical academy",
    "Seoul, South Korea",
    "Active",
    "hannah.lee@northstar.example",
    "2026-08-08",
    "The first learning path is available to pilot groups and includes practical exercises with guided reviews.",
  ],
].map(([employee, department, project, location, status, email, updated, notes], index) => ({
  department,
  email,
  employee,
  id: index + 1,
  location,
  notes,
  project,
  status: status as ShowcaseRow["status"],
  updated,
}));

function ShowcaseTableTemplate() {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor | undefined>({
    column: "employee",
    direction: "ascending",
  });

  const sortedRows = React.useMemo(() => {
    if (!sortDescriptor) return showcaseRows;

    const column = String(sortDescriptor.column) as keyof ShowcaseRow;

    return [...showcaseRows].sort((a, b) => {
      const result = String(a[column]).localeCompare(String(b[column]));

      return sortDescriptor.direction === "descending" ? -result : result;
    });
  }, [sortDescriptor]);

  const sortableHeader = (id: keyof ShowcaseRow, label: string) => (
    <Table.Column
      allowsSorting
      defaultWidth={180}
      id={id}
      isRowHeader={id === "employee"}
      tooltipProps={{isDisabled: true}}
    >
      {({sortDirection}) => (
        <Table.SortableColumnHeader sortDirection={sortDirection}>
          {label}
        </Table.SortableColumnHeader>
      )}
    </Table.Column>
  );

  return (
    <Wrapper>
      <Table className="max-w-5xl">
        <Table.ManagedColumns
          columns={[
            {id: "select", pinned: "start", width: 72},
            {id: "employee", width: 180},
            {id: "department", width: 180},
            {id: "project", width: 220},
            {id: "location", width: 190},
            {id: "status", width: 130},
            {id: "email", width: 260},
            {id: "updated", width: 180},
            {id: "notes", width: 340},
            {id: "actions", pinned: "end", width: 120},
          ]}
        >
          <Table.ScrollContainer className="max-h-[360px]">
            <Table.Content
              aria-label="Northstar operations showcase"
              selectedKeys={selectedKeys}
              selectionMode="multiple"
              sortDescriptor={sortDescriptor}
              onSelectionChange={setSelectedKeys}
              onSortChange={setSortDescriptor}
            >
              <Table.Header>
                <Table.Column
                  aria-label="Select rows"
                  id="select"
                  tooltipProps={{isDisabled: true}}
                >
                  <Table.SelectionCheckbox aria-label="Select all rows" />
                </Table.Column>
                {sortableHeader("employee", "Employee name and primary contact")}
                {sortableHeader("department", "Department and organizational group")}
                {sortableHeader("project", "Current strategic initiative and delivery programme")}
                <Table.Column id="location" tooltipProps={{isDisabled: true}}>
                  Office location and regional hub
                </Table.Column>
                <Table.Column id="status" tooltipProps={{isDisabled: true}}>
                  Delivery status and escalation state
                </Table.Column>
                <Table.Column id="email" tooltipProps={{isDisabled: true}}>
                  Work email and notification address
                </Table.Column>
                {sortableHeader("updated", "Last operational update date")}
                <Table.Column id="notes" tooltipProps={{isDisabled: true}}>
                  Latest programme note and follow-up context
                </Table.Column>
                <Table.Column className="text-end" id="actions" tooltipProps={{isDisabled: true}}>
                  Actions
                </Table.Column>
              </Table.Header>
              <Table.Body>
                {sortedRows.map((row) => (
                  <Table.Row key={row.id} id={row.id}>
                    <Table.Cell>
                      <Table.SelectionCheckbox
                        aria-label={`Select ${row.employee}`}
                        variant="secondary"
                      />
                    </Table.Cell>
                    <Table.Cell>{row.employee}</Table.Cell>
                    <Table.Cell>{row.department}</Table.Cell>
                    <Table.Cell>{row.project}</Table.Cell>
                    <Table.Cell>{row.location}</Table.Cell>
                    <Table.Cell>{row.status}</Table.Cell>
                    <Table.Cell>{row.email}</Table.Cell>
                    <Table.Cell>{row.updated}</Table.Cell>
                    <Table.Cell>{row.notes}</Table.Cell>
                    <Table.Cell className="text-end">
                      <div className="flex justify-end gap-1">
                        <Button
                          isIconOnly
                          aria-label={`Edit ${row.employee}`}
                          size="sm"
                          variant="ghost"
                        >
                          <Icon icon="gravity-ui:pencil" />
                        </Button>
                        <Button
                          isIconOnly
                          aria-label={`Delete ${row.employee}`}
                          size="sm"
                          variant="ghost"
                        >
                          <Icon icon="gravity-ui:trash-bin" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
              <Table.Summary isSticky>
                <Table.Row>
                  <Table.Cell isRowHeader>Total</Table.Cell>
                  <Table.Cell>{showcaseRows.length} members</Table.Cell>
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell>
                    {showcaseRows.filter((row) => row.status === "Active").length} active
                  </Table.Cell>
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell />
                </Table.Row>
              </Table.Summary>
            </Table.Content>
          </Table.ScrollContainer>
        </Table.ManagedColumns>
      </Table>
    </Wrapper>
  );
}

export const V3Enhancements: Story = {
  render: () => <ShowcaseTableTemplate />,
};

/**
 * Column resizing with drag handles between columns.
 */
export const ColumnResizing: Story = {
  render: () => (
    <Wrapper>
      <Table>
        <Table.ResizableContainer>
          <Table.Content aria-label="Column resizing" className="min-w-[700px]">
            <Table.Header>
              <Table.Column isRowHeader defaultWidth="1fr" id="name" minWidth={160}>
                Name
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column defaultWidth="1fr" id="role" minWidth={220}>
                Role
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column defaultWidth="1fr" id="status" minWidth={100}>
                Status
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column defaultWidth="1fr" id="email" minWidth={200}>
                Email
              </Table.Column>
            </Table.Header>
            <Table.Body items={users}>
              {(user) => (
                <Table.Row>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{user.role}</Table.Cell>
                  <Table.Cell>
                    <Chip color={statusColorMap[user.status]} size="sm" variant="soft">
                      {user.status}
                    </Chip>
                  </Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ResizableContainer>
      </Table>
    </Wrapper>
  ),
};

/**
 * Managed native columns combine flexible sizing, logical start/end pinning, resizing, overflow
 * disclosure, and a native summary row group. Definitions must match leaf cells by id and order.
 */
export const ManagedColumns: Story = {
  render: () => (
    <Wrapper>
      <Table>
        <Table.ManagedColumns
          columns={[
            {id: "name", minWidth: 160, pinned: "start", width: 180},
            {id: "role", flex: 1, minWidth: 260},
            {id: "status", minWidth: 130, width: 130},
            {id: "email", minWidth: 260, width: 260},
            {id: "actions", pinned: "end", width: 100},
          ]}
        >
          <Table.ResizableContainer className="max-h-72 max-w-4xl overflow-auto">
            <Table.Content aria-label="Managed columns">
              <Table.Header>
                <Table.Column isRowHeader id="name">
                  Name
                  <Table.ColumnResizer />
                </Table.Column>
                <Table.Column id="role">
                  <Table.Overflow tooltip>Responsibility and organizational role</Table.Overflow>
                  <Table.ColumnResizer />
                </Table.Column>
                <Table.Column id="status">
                  Status
                  <Table.ColumnResizer />
                </Table.Column>
                <Table.Column id="email">
                  Email
                  <Table.ColumnResizer />
                </Table.Column>
                <Table.Column id="actions">Actions</Table.Column>
              </Table.Header>
              <Table.Body items={users.slice(0, 6)}>
                {(user) => (
                  <Table.Row>
                    <Table.Cell>{user.name}</Table.Cell>
                    <Table.Cell>
                      <Table.Overflow tooltip>{user.role}</Table.Overflow>
                    </Table.Cell>
                    <Table.Cell>{user.status}</Table.Cell>
                    <Table.Cell>
                      <Table.Overflow tooltip>{user.email}</Table.Overflow>
                    </Table.Cell>
                    <Table.Cell>Edit</Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
              <Table.Summary isSticky>
                <Table.Row id="summary">
                  <Table.Cell>Visible members</Table.Cell>
                  <Table.Cell>6</Table.Cell>
                  <Table.Cell>—</Table.Cell>
                  <Table.Cell>—</Table.Cell>
                  <Table.Cell>—</Table.Cell>
                </Table.Row>
              </Table.Summary>
            </Table.Content>
          </Table.ResizableContainer>
        </Table.ManagedColumns>
      </Table>
    </Wrapper>
  ),
};

/**
 * One level of column groups above the header (`Table.ManagedColumns` native mode only). Groups
 * follow the leaf geometry: resizing a member widens its segment, and pinned segments stick and
 * cast the pinned shadow with their columns.
 */
const columnGroupMembers = Array.from({length: 8}, (_, index) => ({
  depositAmount: (index + 1) * 1250,
  depositCount: index + 3,
  id: String(index + 1),
  name: `Member ${index + 1}`,
  withdrawAmount: (index + 1) * 480,
  withdrawCount: index + 1,
}));

const ColumnGroupsTable = ({variant}: {variant: "primary" | "secondary"}) => (
  <Table variant={variant}>
    <Table.ManagedColumns
      columnGroups={[
        {columns: ["depositCount", "depositAmount"], id: "deposit", label: "存款"},
        {columns: ["withdrawCount", "withdrawAmount"], id: "withdraw", label: "提款"},
      ]}
      columns={[
        {id: "select", minWidth: 56, pinned: "start", width: 56},
        {id: "name", minWidth: 160, width: 180},
        {id: "depositCount", width: 140},
        {id: "depositAmount", width: 160},
        {id: "withdrawCount", width: 140},
        {id: "withdrawAmount", width: 160},
        {id: "actions", pinned: "end", width: 100},
      ]}
    >
      <Table.ResizableContainer className="max-h-72 max-w-3xl overflow-auto">
        <Table.Content aria-label={`Column groups (${variant})`} selectionMode="multiple">
          <Table.Header>
            <Table.Column aria-label="Select rows" id="select">
              <Table.SelectionCheckbox aria-label="Select all rows" />
            </Table.Column>
            <Table.Column isRowHeader id="name">
              Name
              <Table.ColumnResizer />
            </Table.Column>
            <Table.Column id="depositCount">
              次数
              <Table.ColumnResizer />
            </Table.Column>
            <Table.Column id="depositAmount">
              金额
              <Table.ColumnResizer />
            </Table.Column>
            <Table.Column id="withdrawCount">
              次数
              <Table.ColumnResizer />
            </Table.Column>
            <Table.Column id="withdrawAmount">
              金额
              <Table.ColumnResizer />
            </Table.Column>
            <Table.Column id="actions">Actions</Table.Column>
          </Table.Header>
          <Table.Body items={columnGroupMembers}>
            {(member) => (
              <Table.Row>
                <Table.Cell>
                  <Table.SelectionCheckbox aria-label={`Select ${member.name}`} />
                </Table.Cell>
                <Table.Cell>{member.name}</Table.Cell>
                <Table.Cell>{member.depositCount}</Table.Cell>
                <Table.Cell>{member.depositAmount}</Table.Cell>
                <Table.Cell>{member.withdrawCount}</Table.Cell>
                <Table.Cell>{member.withdrawAmount}</Table.Cell>
                <Table.Cell>Edit</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ResizableContainer>
    </Table.ManagedColumns>
  </Table>
);

export const ColumnGroups: Story = {
  render: () => (
    <Wrapper>
      <div className="flex flex-col gap-8">
        <ColumnGroupsTable variant="primary" />
        <ColumnGroupsTable variant="secondary" />
      </div>
    </Wrapper>
  ),
};

/**
 * Report layout: controlled leaf widths (`fillContainer` hands spare width to them on wide
 * screens), grouped leaves under their group, ungrouped columns spanning both header levels.
 * When the summed widths exceed the container, the table scrolls horizontally inside it.
 */
interface MemberReportRow {
  bank: string;
  bets: string;
  commission: [number, number];
  deposit: [number, number];
  id: string;
  lastDeposit: string;
  lastLogin: string;
  manual: [number, number];
  name: string;
  phone: string;
  promotion: [number, number];
  registeredAt: string;
  withdraw: [number, number];
}

const memberReportNames = ["Alex Tan", "Brian Lim Wei Jie", "Chandra Kumar", "Diana Wong"];
const memberReportBanks = ["CIMB", "MBB", "TNG"];
const memberReportBets = ["META (1) JILI (1)", "MG888H52 (1)", "META2 (1) WF2 (1)", ""];

const memberReportRows: MemberReportRow[] = Array.from({length: 12}, (_, index) => {
  const deposits = index % 4 === 0 ? 1 : 0;
  const promotions = index % 3;

  return {
    bank: memberReportBanks[index % memberReportBanks.length]!,
    bets: memberReportBets[index % memberReportBets.length]!,
    commission: [0, 0],
    deposit: [deposits, deposits * 60],
    id: String(index + 1),
    lastDeposit: deposits ? `2026-11-03 0${index % 10}:22` : "-",
    lastLogin: `2026-11-0${3 - (index % 2)} ${String(23 - index).padStart(2, "0")}:45`,
    manual: [0, 0],
    name: `${memberReportNames[index % memberReportNames.length]} ${index + 1}`,
    phone: `6012${String(1000000 + index * 7919).slice(0, 7)}`,
    promotion: [promotions, promotions * 55],
    registeredAt: `2026-11-0${3 - (index % 2)} ${String(23 - index).padStart(2, "0")}:19`,
    withdraw: [0, 0],
  };
});

type MemberReportPair = "commission" | "deposit" | "manual" | "promotion" | "withdraw";

const memberReportPairs: {id: MemberReportPair; label: string}[] = [
  {id: "deposit", label: "存款"},
  {id: "withdraw", label: "提款"},
  {id: "promotion", label: "促销"},
  {id: "manual", label: "手动"},
  {id: "commission", label: "佣金"},
];
const memberReportCashPairs = memberReportPairs.slice(0, 2);
const memberReportBonusPairs = memberReportPairs.slice(2);

const memberReportPairColumns = (pairs: typeof memberReportPairs) =>
  pairs.flatMap(({id}) => [
    {id: `${id}Count`, maxWidth: 52, minWidth: 52, width: 52},
    {id: `${id}Amount`, maxWidth: 76, width: 76},
  ]);

const memberReportPairHeaders = (pairs: typeof memberReportPairs) =>
  pairs.flatMap(({id}) => [
    <Table.Column key={`${id}Count`} className="text-end" id={`${id}Count`}>
      次数
    </Table.Column>,
    <Table.Column key={`${id}Amount`} className="text-end" id={`${id}Amount`}>
      总额
    </Table.Column>,
  ]);

const memberReportPairCells = (pairs: typeof memberReportPairs, row: MemberReportRow) =>
  pairs.flatMap(({id}) => [
    <Table.Cell key={`${id}Count`} className="text-end tabular-nums">
      {row[id][0]}
    </Table.Cell>,
    <Table.Cell key={`${id}Amount`} className="text-end tabular-nums">
      {row[id][1].toFixed(2)}
    </Table.Cell>,
  ]);

/**
 * Compact density without a library `size` prop: scope overrides to this table through the
 * documented `data-slot` hooks. Grouped leaves keep the group bar offset in their top padding,
 * so they get their own `pt`. A `Table.Virtualizer` also needs a smaller `layoutOptions.rowHeight`.
 * Column widths below are sized for this `px-3 text-xs`; numeric columns cap `maxWidth` so
 * `fillContainer` hands spare width to the text columns instead.
 */
const memberReportCompactClassName =
  "[--table-column-groups-height:1.75rem] [&_[data-slot=table-cell]]:px-3 [&_[data-slot=table-cell]]:py-1 [&_[data-slot=table-cell]]:text-xs [&_[data-slot=table-column]]:px-3 [&_[data-slot=table-column]]:pb-1.5 [&_[data-slot=table-column]:not([data-grouped])]:pt-1.5 [&_[data-slot=table-column][data-grouped]]:pt-[calc(0.375rem+var(--table-column-groups-height))]";

/** Row buttons follow the compact density; the smallest Button size is still 32px tall. */
const memberReportButtonClassName = "h-6 px-2 text-xs";

export const ColumnGroupsReport: Story = {
  parameters: {layout: "padded"},
  render: () => (
    <Table isTruncate className={memberReportCompactClassName}>
      <Table.ManagedColumns
        fillContainer
        columnGroups={memberReportPairs.map(({id, label}) => ({
          columns: [`${id}Count`, `${id}Amount`],
          id,
          label,
        }))}
        columns={[
          {id: "registeredAt", width: 128},
          {id: "name", width: 144},
          {id: "phone", width: 104},
          {id: "bank", maxWidth: 64, minWidth: 64, width: 64},
          {id: "actions", maxWidth: 112, width: 112},
          ...memberReportPairColumns(memberReportCashPairs),
          {id: "winLoss", maxWidth: 76, width: 76},
          ...memberReportPairColumns(memberReportBonusPairs),
          {id: "lastDeposit", width: 128},
          {id: "lastLogin", width: 128},
          {id: "bets", width: 160},
        ]}
      >
        <Table.ScrollContainer className="max-h-96 overflow-auto">
          <Table.Content aria-label="Member report">
            <Table.Header>
              <Table.Column id="registeredAt">注册日期</Table.Column>
              <Table.Column isRowHeader id="name">
                名字
              </Table.Column>
              <Table.Column id="phone">手机号</Table.Column>
              <Table.Column id="bank">银行</Table.Column>
              <Table.Column id="actions">动作</Table.Column>
              {memberReportPairHeaders(memberReportCashPairs)}
              <Table.Column className="text-end" id="winLoss">
                赢/输
              </Table.Column>
              {memberReportPairHeaders(memberReportBonusPairs)}
              <Table.Column id="lastDeposit">最后存款</Table.Column>
              <Table.Column id="lastLogin">最后登录</Table.Column>
              <Table.Column id="bets">投注</Table.Column>
            </Table.Header>
            <Table.Body items={memberReportRows}>
              {(row) => (
                <Table.Row>
                  <Table.Cell>{row.registeredAt}</Table.Cell>
                  <Table.Cell>{row.name}</Table.Cell>
                  <Table.Cell>{row.phone}</Table.Cell>
                  <Table.Cell>{row.bank}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-1">
                      <Button className={memberReportButtonClassName} size="sm" variant="secondary">
                        聊天
                      </Button>
                      <Button className={memberReportButtonClassName} size="sm" variant="secondary">
                        钱包
                      </Button>
                    </div>
                  </Table.Cell>
                  {memberReportPairCells(memberReportCashPairs, row)}
                  <Table.Cell className="text-end tabular-nums">
                    {(row.deposit[1] - row.withdraw[1]).toFixed(2)}
                  </Table.Cell>
                  {memberReportPairCells(memberReportBonusPairs, row)}
                  <Table.Cell>{row.lastDeposit}</Table.Cell>
                  <Table.Cell>{row.lastLogin}</Table.Cell>
                  <Table.Cell>{row.bets || "-"}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table.ManagedColumns>
    </Table>
  ),
};

/** Presentational overlay for refresh/sort/filter loading; the caller owns loading state. */
export const LoadingOverlay: Story = {
  render: () => (
    <Wrapper>
      <Table aria-busy="true" className="min-h-64">
        <Table.ScrollContainer>
          <Table.Content aria-label="Refreshing users" className="min-w-[600px]">
            <Table.Header>
              {columns.map((column) => (
                <Table.Column key={column.id} id={column.id} isRowHeader={column.isRowHeader}>
                  {column.name}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body items={users.slice(0, 4)}>
              {(user) => (
                <Table.Row>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{user.role}</Table.Cell>
                  <Table.Cell>{user.status}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        <Table.LoadingOverlay aria-label="Refreshing users">
          <Spinner />
        </Table.LoadingOverlay>
      </Table>
    </Wrapper>
  ),
};

/**
 * Async loading with infinite scroll using Table.LoadMore.
 * Simulates fetching paginated data — scroll to the bottom to load more rows.
 */
const ITEMS_PER_PAGE = 6;

function useAsyncUsers() {
  const [items, setItems] = React.useState<User[]>(() => users.slice(0, ITEMS_PER_PAGE));
  const [isLoading, setIsLoading] = React.useState(false);
  const isLoadingRef = React.useRef(false);
  const hasMore = items.length < users.length;

  const loadMore = React.useCallback(() => {
    if (!hasMore || isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setItems((prev) => users.slice(0, prev.length + ITEMS_PER_PAGE));
      setIsLoading(false);
      requestAnimationFrame(() => {
        isLoadingRef.current = false;
      });
    }, 1500);
  }, [hasMore]);

  return {hasMore, isLoading, items, loadMore};
}

export const AsyncLoading: Story = {
  args: {
    variant: "primary",
  },
  render: ({variant}) => {
    const {hasMore, isLoading, items, loadMore} = useAsyncUsers();

    return (
      <Wrapper>
        <Table variant={variant}>
          <Table.ScrollContainer className="h-[280px] overflow-y-auto">
            <Table.Content aria-label="Async loading" className="min-w-[600px]">
              <Table.Header>
                {columns.map((col) => (
                  <Table.Column key={col.id} id={col.id} isRowHeader={col.isRowHeader}>
                    {col.name}
                  </Table.Column>
                ))}
              </Table.Header>
              <Table.Body>
                <Table.Collection items={items}>
                  {(user) => (
                    <Table.Row>
                      <Table.Cell>{user.name}</Table.Cell>
                      <Table.Cell>{user.role}</Table.Cell>
                      <Table.Cell>
                        <Chip color={statusColorMap[user.status]} size="sm" variant="soft">
                          {user.status}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>{user.email}</Table.Cell>
                    </Table.Row>
                  )}
                </Table.Collection>
                {!!hasMore && (
                  <Table.LoadMore isLoading={isLoading} scrollOffset={0} onLoadMore={loadMore}>
                    <Table.LoadMoreContent>
                      <Spinner size="md" />
                    </Table.LoadMoreContent>
                  </Table.LoadMore>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Wrapper>
    );
  },
};

/**
 * First-class virtualization shares managed widths. Pinning and native Summary are intentionally
 * native-only and are ignored in this mode.
 */
export const Virtualization: Story = {
  render: () => {
    const roles = [
      "Software Engineer",
      "Senior Engineer",
      "Staff Engineer",
      "Product Manager",
      "Designer",
      "Data Analyst",
      "QA Engineer",
      "DevOps Engineer",
      "Marketing Manager",
      "Sales Representative",
    ];

    const statuses: User["status"][] = ["Active", "Inactive", "On Leave"];

    const firstNames = [
      "Emma",
      "Liam",
      "Olivia",
      "Noah",
      "Ava",
      "James",
      "Sophia",
      "Oliver",
      "Isabella",
      "Lucas",
      "Mia",
      "Ethan",
      "Charlotte",
      "Mason",
      "Amelia",
      "Logan",
      "Harper",
      "Alexander",
      "Ella",
      "Benjamin",
    ];

    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
      "Anderson",
      "Taylor",
      "Thomas",
      "Jackson",
      "White",
      "Harris",
      "Clark",
      "Lewis",
      "Robinson",
      "Walker",
    ];

    function generateUsers(n: number): User[] {
      const users: User[] = [];

      for (let i = 0; i < n; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
        const name = `${firstName} ${lastName}`;

        users.push({
          id: i + 1,
          name,
          image_url: `https://assets.sy-inc.com/avatars/red.jpg`,
          role: roles[i % roles.length],
          status: statuses[i % statuses.length],
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@acme.com`,
        });
      }

      return users;
    }

    const virtualizedUsers = generateUsers(1000);

    return (
      <Table>
        <Table.Virtualizer
          columns={[
            {id: "name", minWidth: 160},
            {id: "role", minWidth: 220},
            {id: "email", minWidth: 240},
          ]}
          layoutOptions={{
            rowHeight: 42,
            headingHeight: 42,
          }}
        >
          <Table.Content
            aria-label="Virtualized table with 1000 rows"
            className="h-[500px] min-w-[700px] overflow-auto scrollbar"
          >
            <Table.Header className="h-full w-full">
              <Table.Column isRowHeader id="name">
                Name
              </Table.Column>
              <Table.Column id="role">Role</Table.Column>
              <Table.Column id="email">Email</Table.Column>
            </Table.Header>
            <Table.Body items={virtualizedUsers}>
              {(user) => (
                <Table.Row>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{user.role}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.Virtualizer>
      </Table>
    );
  },
};

export const ExpandableRows: Story = {
  render: () => {
    type Row = {
      children: Row[];
      date: string;
      id: string;
      title: string;
      type: string;
    };

    const data: Row[] = [
      {
        children: [
          {
            children: [
              {children: [], date: "7/10/2025", id: "3", title: "Weekly Report", type: "File"},
              {children: [], date: "8/20/2025", id: "4", title: "Budget", type: "File"},
            ],
            date: "8/2/2025",
            id: "2",
            title: "Project",
            type: "Directory",
          },
        ],
        date: "10/20/2025",
        id: "1",
        title: "Documents",
        type: "Directory",
      },
      {
        children: [
          {children: [], date: "1/23/2026", id: "6", title: "Image 1", type: "File"},
          {children: [], date: "2/3/2026", id: "7", title: "Image 2", type: "File"},
        ],
        date: "2/3/2026",
        id: "5",
        title: "Photos",
        type: "Directory",
      },
    ];

    const [expandedKeys, setExpandedKeys] = React.useState<Selection>(() => new Set(["1"]));

    const renderExpandableRow = (item: Row) => {
      return (
        <Table.Row id={item.id} textValue={item.title}>
          <Table.Cell textValue={item.title}>
            {({hasChildItems, isDisabled, isExpanded, isTreeColumn}) => (
              <span className="flex items-center gap-1">
                {hasChildItems && isTreeColumn ? (
                  <Button
                    isIconOnly
                    aria-label="Toggle row"
                    isDisabled={isDisabled}
                    size="sm"
                    slot="chevron"
                    variant="ghost"
                  >
                    <Icon
                      aria-hidden
                      icon="gravity-ui:chevron-right"
                      className={cn(
                        "size-4 text-muted transition-transform duration-150",
                        isExpanded ? "rotate-90" : "rtl:rotate-180",
                      )}
                    />
                  </Button>
                ) : null}
                <span>{item.title}</span>
              </span>
            )}
          </Table.Cell>
          <Table.Cell>{item.type}</Table.Cell>
          <Table.Cell>{item.date}</Table.Cell>
          <Table.Collection items={item.children}>{renderExpandableRow}</Table.Collection>
        </Table.Row>
      );
    };

    return (
      <Wrapper>
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Files"
              className="min-w-[520px]"
              expandedKeys={expandedKeys}
              treeColumn="name"
              onExpandedChange={setExpandedKeys}
            >
              <Table.Header>
                <Table.Column isRowHeader id="name">
                  Name
                </Table.Column>
                <Table.Column id="type">Type</Table.Column>
                <Table.Column id="date">Date Modified</Table.Column>
              </Table.Header>
              <Table.Body items={data}>{renderExpandableRow}</Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Wrapper>
    );
  },
};
