import {
  ReadHole,
  ReadWriteHole,
} from "https://raw.githubusercontent.com/toughsoft/thing-hole/2.0.1/mod.ts";
import dynamodb from "https://raw.githubusercontent.com/toughsoft/dynamodb-client/1.2.1/mod.ts";
import {
  DynamodbClient,
  dynamoDriver,
  dynamoIndexDriver,
} from "https://raw.githubusercontent.com/toughsoft/thing-hole/2.0.1/dynamodb/mod.ts";

export type Icon = {
  imageData: string;
  bytes: number;
  width: number;
  height: number;
  query: string;
  title: string;
  uri: string;
  // TODO Remove boolean option once fully purged from DB
  starred: number | boolean;
};

export type ReadIconHole = ReadHole<Icon>;
export type ReadWriteIconHole = ReadWriteHole<Icon>;

export type IconHoleOptions<
  Starred extends boolean = false,
> = {
  table: string;
  tag?: string;
  dynamo?: DynamodbClient;
  starred?: Starred;
};

const DefaultDynamoClient = dynamodb();

function create(options: Omit<IconHoleOptions, "starred">): ReadWriteIconHole;
function create(options: IconHoleOptions<true>): ReadIconHole;
function create(options: IconHoleOptions<false>): ReadWriteIconHole;
function create(
  options: IconHoleOptions<boolean>,
): ReadIconHole | ReadWriteIconHole;

function create<Starred extends boolean>({
  table,
  dynamo,
  starred,
  tag = "default",
}: IconHoleOptions<Starred>): ReadIconHole | ReadWriteIconHole {
  const commonOptions = {
    client: dynamo ?? DefaultDynamoClient,
    table,
    id: {
      key: "id",
      prefix: tag,
    },
  };

  if (starred === true) {
    return dynamoIndexDriver<Icon>({
      ...commonOptions,
      index: {
        name: "StarredIndex",
        key: "starred",
        value: 1,
      },
      partition: {
        key: "partition",
        prefix: "v1",
      },
    });
  } else {
    return dynamoDriver<Icon>({
      ...commonOptions,
      partition: {
        size: 1,
        prefix: "v1",
        key: "partition",
      },
    });
  }
}

export default create;
