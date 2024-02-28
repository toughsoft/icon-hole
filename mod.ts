import dynamo, {
  DynamodbClientOptions,
} from "https://raw.githubusercontent.com/toughsoft/dynamodb-client/1.0.0/mod.ts";
import {
  dynamoDriver,
  dynamoIndexDriver,
  ReadHole,
  ReadWriteHole,
} from "https://raw.githubusercontent.com/toughsoft/thing-hole/1.0.0/mod.ts";

export interface Icon {
  imageDate: string;
  bytes: number;
  width: number;
  height: number;
  query: string;
  title: string;
  uri: string;
}

export type ReadIconHole = ReadHole<Icon>;
export type ReadWriteIconHole = ReadWriteHole<Icon>;

export interface IconHoleOptions<
  Starred extends boolean | undefined = undefined,
> {
  tag?: string;
  starred?: Starred;
  dynamoConfig?: DynamodbClientOptions;
}

function create(options: IconHoleOptions<true>): ReadIconHole;
function create(options: IconHoleOptions<false>): ReadWriteIconHole;
function create(options: IconHoleOptions<undefined>): ReadWriteIconHole;
function create<Starred extends boolean | undefined = undefined>({
  starred,
  tag = "default",
  dynamoConfig = {},
}: IconHoleOptions<Starred> = {}): ReadIconHole | ReadWriteIconHole {
  const client = dynamo(dynamoConfig);
  const commonOptions = {
    client,
    table: "icon_store",
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
