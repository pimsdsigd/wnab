import { contains, DataAccessor } from "@damntools.fr/sqlite";
import { Collectors, List } from "@damntools.fr/types";
import { Logger, Logging } from "@damntools.fr/logger-simple";
import { DataMapper, DBO } from "@damntools.fr/data";
import { DataService } from "@damntools.fr/express-utils";

export abstract class AbstractDataService<T, D extends DBO<number>>
  implements DataService<number, T>
{
  protected readonly repository: DataAccessor<number, D>;
  protected readonly mapper: DataMapper<T, D>;
  protected readonly logger: Logger;

  protected constructor(
    repository: DataAccessor<number, D>,
    mapper: DataMapper<T, D>,
  ) {
    this.repository = repository;
    this.mapper = mapper;
    this.logger = Logging.getLogger("DataService_" + this.repository.table());
  }

  getAll(limit?: number): Promise<List<T>> {
    return this.repository.getAll(limit).then((dbos) =>
      dbos
        .stream()
        .map((d) => this.mapper.mapTo(d))
        .collect(Collectors.toList),
    );
  }

  getById(id: number): Promise<T> {
    return this.repository.getById(id).then((dbo) => this.mapper.mapTo(dbo));
  }

  deleteById(id: number): Promise<void> {
    return this.repository.deleteById(id).then(() => {
      /****/
    });
  }

  insert(data: T): Promise<T> {
    const dbo = this.mapper.mapFrom(data);
    return this.repository.insert(dbo).then((id) => {
      // @ts-ignore
      data.id = id;
      return data;
    });
  }

  insertAll(data: List<T>): Promise<List<number>> {
    const dbos = data
      .stream()
      .map((d) => this.mapper.mapFrom(d))
      .collect(Collectors.toList);
    return this.repository.insertRows(dbos).then((ids) => ids as List<number>);
  }

  insertBatch(data: List<T>): Promise<void> {
    const dbos = data
      .stream()
      .map((d) => this.mapper.mapFrom(d))
      .collect(Collectors.toList);
    return this.repository.insertBatch(dbos);
  }

  update(data: T): Promise<T> {
    const dbo = this.mapper.mapFrom(data);
    return this.repository.update(dbo.id as number, dbo).then(() => data);
  }

  updateAll(data: List<T>): Promise<List<T>> {
    const dbos = data
      .stream()
      .map((d) => this.mapper.mapFrom(d))
      .collect(Collectors.toList);
    return this.repository.updateRows(dbos).then((dbo) =>
      dbo
        .stream()
        .map((d) => this.mapper.mapTo(d))
        .collect(Collectors.toList),
    );
  }

  updateBatch(data: List<T>): Promise<List<T>> {
    const dbos = data
      .stream()
      .map((d) => this.mapper.mapFrom(d))
      .collect(Collectors.toList);
    return this.repository.updateBatch(dbos).then(() => data);
  }

  deleteByIds(ids: List<number>): Promise<void> {
    return this.repository.deleteByIds(ids);
  }

  getByIds(ids: List<number>): Promise<List<T>> {
    return this.repository
      .find(contains("id", ...ids.getInner()))
      .then((dbos) =>
        dbos
          .stream()
          .map((d) => this.mapper.mapTo(d))
          .collect(Collectors.toList),
      );
  }
}
