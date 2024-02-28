import dynamo, {
  DynamodbClientOptions,
} from "https://raw.githubusercontent.com/toughsoft/dynamodb-client/1.0.0/mod.ts";
import {
  dynamoDriver,
  dynamoIndexDriver,
  ReadHole,
  ReadWriteHole,
} from "https://raw.githubusercontent.com/toughsoft/thing-hole/1.0.0/mod.ts";

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
  dynamoConfig?: DynamodbClientOptions;
  starred?: Starred;
};

function create(options: Omit<IconHoleOptions, "starred">): ReadWriteIconHole;
function create(options: IconHoleOptions<true>): ReadIconHole;
function create(options: IconHoleOptions<false>): ReadWriteIconHole;
function create(
  options: IconHoleOptions<boolean>,
): ReadIconHole | ReadWriteIconHole;

function create<Starred extends boolean>({
  table,
  starred,
  tag = "default",
  dynamoConfig = {},
}: IconHoleOptions<Starred>): ReadIconHole | ReadWriteIconHole {
  const client = dynamo(dynamoConfig);
  const commonOptions = {
    client,
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
