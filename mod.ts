import dynamo, {
  DynamodbClientOptions,
} from "https://raw.githubusercontent.com/toughsoft/dynamodb-client/1.0.0/mod.ts";
import {
  dynamoDriver,
  dynamoIndexDriver,
  ReadHole,
  ReadWriteHole,
} from "https://raw.githubusercontent.com/toughsoft/thing-hole/1.0.0/mod.ts";

interface Icon {
  imageDate: string;
  bytes: number;
  width: number;
  height: number;
  query: string;
  title: string;
  uri: string;
}

interface IconHoleOptions<Starred extends boolean | undefined = undefined> {
  tag?: string;
  starred?: Starred;
  dynamoConfig?: DynamodbClientOptions;
}

function create(options: IconHoleOptions<true>): ReadHole<Icon>;
function create(options: IconHoleOptions<false>): ReadWriteHole<Icon>;
function create(options: IconHoleOptions<undefined>): ReadWriteHole<Icon>;
function create<Starred extends boolean | undefined = undefined>({
  starred,
  tag = "default",
  dynamoConfig = {},
}: IconHoleOptions<Starred> = {}): ReadHole<Icon> | ReadWriteHole<Icon> {
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
