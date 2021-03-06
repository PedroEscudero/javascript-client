import Apisearch from "../../../src/Apisearch";
import { expect } from 'chai';
import {Query} from "../../../src/Query/Query";
import {Item} from "../../../src/Model/Item";
import {ItemUUID} from "../../../src/Model/ItemUUID";
import {FILTER_MUST_ALL} from "../../../src/Query/Filter";
import {IndexUUID} from "../../../src/Model/IndexUUID";
import {Config} from "../../../src/Config/Config";

/**
 *
 */
describe('Apisearch', () => {
    let repository = Apisearch.createRepository(
            {
                'app_id': 'test-ts-app-id',
                'index_id': 'test-ts-index-id',
                'token': '0e4d75ba-c640-44c1-a745-06ee51db4e93',
                'options': {
                    'endpoint': 'http://127.0.0.1:8999',
                }
            }
        );

    const indexUUID = IndexUUID.createById('test-ts-index-id');

    it('should properly make a query', async () => {
        await repository.deleteIndex(indexUUID);
        await repository.createIndex(indexUUID, Config.createFromArray({}));
        await repository
            .query(Query.createMatchAll())
            .then(result => {
                expect(result.getTotalItems()).to.be.equal(0);
            })
            .catch(error => {
                console.log(error);
                expect.fail();
            });
    });

    it('should create properly an item and make a query', async () => {
        repository.addItem(Item.create(ItemUUID.createByComposedUUID('1~item')));
        repository.addItem(Item.create(ItemUUID.createByComposedUUID('2~item')));
        repository.addItem(Item.create(ItemUUID.createByComposedUUID('3~item')));
        repository.addItems([
            Item.create(ItemUUID.createByComposedUUID('3~item')),
            Item.create(ItemUUID.createByComposedUUID('4~item')),
            Item.create(ItemUUID.createByComposedUUID('5~item'))
        ]);

        await repository.flush();
        await repository
            .query(Query.createMatchAll())
            .then(result => {
                expect(result.getTotalItems()).to.be.equal(5);
                expect(result.getTotalHits()).to.be.equal(5);
            });

        repository.deleteItem(ItemUUID.createByComposedUUID('1~item'));
        repository.deleteItems([
            ItemUUID.createByComposedUUID('1~item'),
            ItemUUID.createByComposedUUID('2~item'),
            ItemUUID.createByComposedUUID('3~item'),
        ]);

        await repository.flush();
        await repository
            .query(Query.createMatchAll())
            .then(result => {
                expect(result.getTotalItems()).to.be.equal(2);
                expect(result.getTotalHits()).to.be.equal(2);
            });

        repository.deleteItems([
            ItemUUID.createByComposedUUID('4~item'),
            ItemUUID.createByComposedUUID('4~item'),
            ItemUUID.createByComposedUUID('5~item'),
        ]);

        await repository.flush();
        await repository
            .query(Query.createMatchAll())
            .then(result => {
                expect(result.getTotalItems()).to.be.equal(0);
                expect(result.getTotalHits()).to.be.equal(0);
            });
    });



    it('should create properly an item and make a complex query', async () => {
        repository.addItem(Item.create(
            ItemUUID.createByComposedUUID('1~item'),
            {
                'field1': 'value1'
            },
            {
                'category': [
                    1,2
                ]
            },
            {
                'name': 'This is my house'
            },
            [
                '12345'
            ]
        ));

        await repository.flush();
        await repository
            .query(Query.create('house'))
            .then(result => {
                expect(result.getTotalItems()).to.be.equal(1);
                expect(result.getTotalHits()).to.be.equal(1);
            });

        await repository
            .query(Query.createMatchAll().filterUniverseBy('category', [1,2], FILTER_MUST_ALL))
            .then(result => {
                expect(result.getTotalItems()).to.be.equal(1);
                expect(result.getTotalHits()).to.be.equal(1);
            });
    });
});
